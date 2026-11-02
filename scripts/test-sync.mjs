import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const id = Number(process.argv[2] ?? 89);

const sql = `
    UPDATE venta AS v
    SET
      total_hora = COALESCE((
        SELECT SUM(h.precio)
        FROM ventahora h
        WHERE h.id_venta = v.id AND COALESCE(h.n_pago, 0) = 0
      ), 0),
      tota_producto = COALESCE((
        SELECT SUM(p.cantidad::numeric * p.precio)
        FROM ventaproducto p
        WHERE p.id_venta = v.id AND COALESCE(p.n_pago, 0) = 0
      ), 0),
      total = COALESCE((
        SELECT SUM(h.precio)
        FROM ventahora h
        WHERE h.id_venta = v.id AND COALESCE(h.n_pago, 0) = 0
      ), 0)
      + COALESCE((
        SELECT SUM(p.cantidad::numeric * p.precio)
        FROM ventaproducto p
        WHERE p.id_venta = v.id AND COALESCE(p.n_pago, 0) = 0
      ), 0)
    WHERE v.id = $1
  `;

try {
  const result = await pool.query(sql, [id]);
  console.log("OK rowCount", result.rowCount);
} catch (e) {
  console.error("ERR", e.message);
  console.error("detail", e.detail);
  console.error("code", e.code);
}

const cols = await pool.query(
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'venta' ORDER BY ordinal_position`,
);
console.log("venta columns:", cols.rows.map((r) => `${r.column_name}:${r.data_type}`).join(", "));

await pool.end();
