"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
    throw new Error("DATABASE_URL no está definida (env / Fly secrets)");
}
function resolveSsl(url) {
    const flag = (process.env.DATABASE_SSL ?? "").toLowerCase();
    const wantsSsl = flag === "true" ||
        flag === "1" ||
        flag === "require" ||
        /[?&]sslmode=(require|verify-full|verify-ca)/i.test(url);
    if (!wantsSsl)
        return undefined;
    const rejectUnauthorized = (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED ?? "true").toLowerCase() !==
        "false";
    return { rejectUnauthorized };
}
exports.pool = new pg_1.Pool({
    connectionString,
    ssl: resolveSsl(connectionString),
    max: Number(process.env.PG_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
});
//# sourceMappingURL=db.js.map