"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
    throw new Error("DATABASE_URL no está definida en .env");
}
exports.pool = new pg_1.Pool({ connectionString });
//# sourceMappingURL=db.js.map