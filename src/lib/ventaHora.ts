import { pool } from "./db";
import type { VentaHora } from "../types";

export async function listarHoras(idVenta: number): Promise<VentaHora[]> {
  const result = await pool.query(
    `
    SELECT v.id, v.id_venta, v.hora, v.hora_text, v.precio, COALESCE(h.n_pago, 0) AS n_pago
    FROM v_horagrilla v
    INNER JOIN ventahora h ON h.id = v.id
    WHERE v.id_venta = $1
    ORDER BY v.id DESC
    `,
    [idVenta],
  );

  return result.rows.map((row) => ({
    id: row.id,
    idVenta: row.id_venta,
    hora: Number(row.hora),
    horaText: row.hora_text,
    precio: Number(row.precio),
    pagado: 0,
    nPago: Number(row.n_pago),
  }));
}

export async function insertarHora(
  idVenta: number,
  hora: number,
  precio: number,
): Promise<VentaHora> {
  const result = await pool.query(
    `INSERT INTO ventahora (id_venta, hora, precio, pagado, n_pago)
     VALUES ($1, $2, $3, 0, 0) RETURNING id, id_venta, hora, precio, pagado, n_pago`,
    [idVenta, hora, precio],
  );

  const row = result.rows[0];
  return {
    id: row.id,
    idVenta: row.id_venta,
    hora: Number(row.hora),
    horaText: `${row.hora} h`,
    precio: Number(row.precio),
    pagado: row.pagado,
    nPago: Number(row.n_pago ?? 0),
  };
}

export async function eliminarHora(lineaId: number): Promise<number | null> {
  const result = await pool.query(
    `DELETE FROM ventahora WHERE id = $1 RETURNING id_venta`,
    [lineaId],
  );
  return result.rows[0]?.id_venta ?? null;
}

export async function actualizarNPagoHora(
  lineaId: number,
  nPago: number,
): Promise<number | null> {
  const result = await pool.query(
    `UPDATE ventahora SET n_pago = $1 WHERE id = $2 RETURNING id_venta`,
    [nPago, lineaId],
  );
  return result.rows[0]?.id_venta ?? null;
}
