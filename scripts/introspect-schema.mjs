import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const result = await pool.query(`
  SELECT table_name, table_type
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_type, table_name
`);

console.log("Esquema public en", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@"));
for (const row of result.rows) {
  console.log(`  [${row.table_type}] ${row.table_name}`);
}

await pool.end();
