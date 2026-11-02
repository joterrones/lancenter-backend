/**
 * Smoke test contra API Lancenter en ejecución.
 * Uso: npm run dev (otra terminal) && npx tsx scripts/verify-api.ts
 */
const base = process.env.API_BASE ?? "http://localhost:3701";

async function main() {
  const health = await fetch(`${base}/health`).then((r) => r.json());
  console.log("health:", health);

  const loginRes = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL ?? "admin@lancenter.local",
      password: process.env.ADMIN_PASSWORD ?? "admin123",
    }),
  });
  if (!loginRes.ok) throw new Error(`login failed: ${loginRes.status}`);
  const { token } = (await loginRes.json()) as { token: string };

  const equiposRes = await fetch(`${base}/equipos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!equiposRes.ok) throw new Error(`equipos failed: ${equiposRes.status}`);
  const equipos = (await equiposRes.json()) as unknown[];
  console.log(`equipos: ${equipos.length} estaciones`);

  const tiposRes = await fetch(`${base}/tipos-producto`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const tipos = (await tiposRes.json()) as unknown[];
  console.log(`tipos-producto: ${tipos.length} categorías`);

  console.log("verify-api OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
