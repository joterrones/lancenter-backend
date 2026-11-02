import { pool } from "./db";
import type { VentaProducto } from "../types";

export async function listarProductosVenta(
  idVenta: number,
): Promise<VentaProducto[]> {
  const result = await pool.query(
    `
    SELECT v.id, v.id_producto, v.cantidad, v.precio, v.pagado, v.nombre, v.total, v.id_venta,
           COALESCE(p.n_pago, 0) AS n_pago
    FROM v_productogrilla v
    INNER JOIN ventaproducto p ON p.id = v.id
    WHERE v.id_venta = $1
    ORDER BY v.id DESC
    `,
    [idVenta],
  );

  return result.rows.map((row) => ({
    id: row.id,
    idProducto: row.id_producto,
    nombre: row.nombre,
    cantidad: row.cantidad,
    precio: Number(row.precio),
    pagado: row.pagado,
    idVenta: row.id_venta,
    total: Number(row.total),
    nPago: Number(row.n_pago),
  }));
}

export async function insertarProducto(
  idVenta: number,
  idProducto: number,
  cantidad: number,
  precio: number,
): Promise<VentaProducto> {
  const result = await pool.query(
    `INSERT INTO ventaproducto (id_producto, cantidad, precio, pagado, id_venta, n_pago)
     VALUES ($1, $2, $3, 0, $4, 0)
     RETURNING id, id_producto, cantidad, precio, pagado, n_pago`,
    [idProducto, cantidad, precio, idVenta],
  );

  const row = result.rows[0];
  const list = await listarProductosVenta(idVenta);
  const inserted = list.find((p) => p.id === row.id);
  return (
    inserted ?? {
      id: row.id,
      idProducto: row.id_producto,
      nombre: "",
      cantidad: row.cantidad,
      precio: Number(row.precio),
      pagado: row.pagado,
      idVenta,
      total: Number(row.cantidad) * Number(row.precio),
      nPago: Number(row.n_pago ?? 0),
    }
  );
}

export async function eliminarProducto(lineaId: number): Promise<number | null> {
  const result = await pool.query(
    `DELETE FROM ventaproducto WHERE id = $1 RETURNING id_venta`,
    [lineaId],
  );
  return result.rows[0]?.id_venta ?? null;
}

export async function actualizarNPagoProducto(
  lineaId: number,
  nPago: number,
): Promise<number | null> {
  const result = await pool.query(
    `UPDATE ventaproducto SET n_pago = $1 WHERE id = $2 RETURNING id_venta`,
    [nPago, lineaId],
  );
  return result.rows[0]?.id_venta ?? null;
}
