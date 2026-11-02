import { pool } from "./db";
import type { ResumenDiario, UltimaVenta } from "../types";

export async function ultimasVentas(): Promise<UltimaVenta[]> {
  const result = await pool.query(
    `
    SELECT id, fecha, codigo_equipo, total_hora, tota_producto, total
    FROM v_venta
    WHERE pagado = 1
    ORDER BY id DESC
    LIMIT 100
    `,
  );

  return result.rows.map((row) => ({
    id: row.id,
    fecha: formatFecha(row.fecha),
    equipo: row.codigo_equipo,
    totalAlquiler: Number(row.total_hora ?? 0),
    totalProducto: Number(row.tota_producto ?? 0),
    total: Number(row.total ?? 0),
  }));
}

export async function resumenDiario(): Promise<ResumenDiario[]> {
  const result = await pool.query(
    `
    SELECT
      to_char(fecha::date, 'DD/MM/YYYY') AS fecha,
      COALESCE(SUM(total_hora), 0) AS total_hora,
      COALESCE(SUM(tota_producto), 0) AS tota_producto,
      COALESCE(SUM(total), 0) AS total
    FROM v_venta
    WHERE pagado = 1
    GROUP BY fecha::date
    ORDER BY fecha::date DESC
    `,
  );

  return result.rows.map((row) => ({
    fecha: String(row.fecha),
    totalAlquiler: Number(row.total_hora),
    totalProducto: Number(row.tota_producto),
    total: Number(row.total),
  }));
}

function formatFecha(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) {
    return value.toLocaleString("es-PE");
  }
  return String(value);
}
