import { Pool, type PoolConfig } from "pg";

function resolveSsl(url: string): PoolConfig["ssl"] {
  const flag = (process.env.DATABASE_SSL ?? "").toLowerCase();
  const sslmodeMatch = url.match(/[?&]sslmode=([^&]+)/i);
  const sslmode = (sslmodeMatch?.[1] ?? "").toLowerCase();

  const wantsSsl =
    flag === "true" ||
    flag === "1" ||
    flag === "require" ||
    ["require", "verify-ca", "verify-full"].includes(sslmode);

  if (!wantsSsl) return undefined;

  // verify-full / verify-ca: validar CA. require (RDS): no exigir CA local.
  const envReject = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.toLowerCase();
  let rejectUnauthorized: boolean;
  if (envReject === "true" || envReject === "1") {
    rejectUnauthorized = true;
  } else if (envReject === "false" || envReject === "0") {
    rejectUnauthorized = false;
  } else {
    rejectUnauthorized = sslmode === "verify-full" || sslmode === "verify-ca";
  }

  return { rejectUnauthorized };
}

let _pool: Pool | null = null;

/** Pool lazy: la API puede arrancar y responder /health aunque falte DATABASE_URL. */
export function getPool(): Pool {
  if (_pool) return _pool;

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definida. En Fly: fly secrets set DATABASE_URL=...",
    );
  }

  // pg reciente trata sslmode=require como verify-full; uselibpqcompat evita eso (RDS).
  let cs = connectionString;
  if (
    /[?&]sslmode=require\b/i.test(cs) &&
    !/[?&]uselibpqcompat=/i.test(cs)
  ) {
    cs += (cs.includes("?") ? "&" : "?") + "uselibpqcompat=true";
  }

  _pool = new Pool({
    connectionString: cs,
    ssl: resolveSsl(cs),
    max: Number(process.env.PG_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });


  _pool.on("error", (err) => {
    console.error("PostgreSQL pool error:", err.message);
  });

  return _pool;
}

/** Compat: `import { pool } from "./db"` sigue funcionando vía Proxy. */
export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const real = getPool();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function checkDatabase(): Promise<{ ok: boolean; error?: string }> {
  if (!hasDatabaseUrl()) {
    return { ok: false, error: "DATABASE_URL missing" };
  }
  try {
    await getPool().query("SELECT 1");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "db check failed",
    };
  }
}
