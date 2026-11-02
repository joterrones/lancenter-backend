import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error("DATABASE_URL no está definida en .env");
}

export const pool = new Pool({ connectionString });
