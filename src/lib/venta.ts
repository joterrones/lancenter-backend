import { pool } from "./db";
import { HttpError } from "../middleware/error";
import type { Venta } from "../types";

function mapVentaRow(row: Record<string, unknown>): Venta {
  return {
    id: row.id as number,
    idEquipo: row.idequipo as number,
    pagado: row.pagado as number,
    codigoEquipo: row.codigo_equipo as string | undefined,
    totalHora: Number(row.total_hora ?? 0),
    totalProducto: Number(row.tota_producto ?? 0),
    total: Number(row.total ?? 0),
    fechaInicio: (row.fecha_inicio as string | null) ?? null,
    fechaFin: (row.fecha_fin as string | null) ?? null,
    restante: (row.restante as number | null) ?? null,
    comentario: (row.comentario as string | null) ?? null,
    acuenta: Number(row.acuenta ?? 0),
    vuelto: Number(row.vuelto ?? 0),
  };
}

export async function sincronizarTotalesDesdeLineasPendientes(
  idVenta: number,
): Promise<boolean> {
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
    const result = await pool.query(sql, [idVenta]);
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    const pgErr = err as { code?: string; message?: string };
    // Igual que ValetorPC: si faltan columnas total_* en venta, no fallar.
    if (pgErr.code === "42703") {
      return false;
    }
    throw err;
  }
}

export async function obtenerVentaActiva(idEquipo: number): Promise<Venta | null> {
  const result = await pool.query(
    `SELECT * FROM v_venta WHERE idequipo = $1 AND pagado = 0 ORDER BY id DESC LIMIT 1`,
    [idEquipo],
  );

  if (result.rows.length === 0) return null;
  return mapVentaRow(result.rows[0]);
}

export async function crearVenta(idEquipo: number): Promise<Venta> {
  const insert = await pool.query(
    `INSERT INTO venta (idequipo, pagado, fecha) VALUES ($1, 0, now()) RETURNING id, idequipo, pagado`,
    [idEquipo],
  );

  const row = insert.rows[0];
  const venta = await obtenerVentaPorId(row.id);
  if (!venta) {
    throw new HttpError(500, "No se pudo recuperar la venta creada");
  }
  return venta;
}

export async function obtenerVentaPorId(id: number): Promise<Venta | null> {
  const result = await pool.query(`SELECT * FROM v_venta WHERE id = $1`, [id]);
  if (result.rows.length === 0) return null;
  return mapVentaRow(result.rows[0]);
}

export async function iniciarVenta(id: number): Promise<Venta> {
  await pool.query(`UPDATE venta SET fecha_inicio = now() WHERE id = $1`, [id]);
  const venta = await obtenerVentaPorId(id);
  if (!venta) throw new HttpError(404, "Venta no encontrada");
  return venta;
}

export async function pagarVenta(id: number): Promise<Venta> {
  await sincronizarTotalesDesdeLineasPendientes(id);
  await pool.query(`UPDATE venta SET pagado = 1 WHERE id = $1`, [id]);
  const venta = await obtenerVentaPorId(id);
  if (!venta) throw new HttpError(404, "Venta no encontrada");
  return venta;
}

export async function actualizarComentario(
  id: number,
  comentario: string,
): Promise<Venta> {
  await pool.query(`UPDATE venta SET comentario = $1 WHERE id = $2`, [
    comentario,
    id,
  ]);
  const venta = await obtenerVentaPorId(id);
  if (!venta) throw new HttpError(404, "Venta no encontrada");
  return venta;
}

export async function actualizarEfectivo(
  id: number,
  acuenta: number,
  vuelto: number,
): Promise<Venta> {
  await sincronizarTotalesDesdeLineasPendientes(id);
  await pool.query(
    `UPDATE venta SET acuenta = $1, vuelto = $2 WHERE id = $3`,
    [acuenta, vuelto, id],
  );
  const venta = await obtenerVentaPorId(id);
  if (!venta) throw new HttpError(404, "Venta no encontrada");
  return venta;
}

import { calcularVuelto } from "./money";