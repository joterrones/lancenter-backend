import { pool } from "./db";
import type { Equipo } from "../types";

export async function listarEquipos(): Promise<Equipo[]> {
  const result = await pool.query("SELECT * FROM v_equipo2 ORDER BY id");

  return result.rows.map((row) => ({
    id: row.id,
    codigo: row.codigo,
    codigoTipoEquipo: row.codigo_tipo_equipo,
    precioq: Number(row.precioq),
    preciom: Number(row.preciom),
    precioh: Number(row.precioh),
    preciot: Number(row.preciot),
    fechaInicio: row.fecha_inicio ?? null,
    fechaFin: row.fecha_fin ?? null,
    restante: row.restante ?? null,
    minutos: row.minutos ?? null,
    total: row.total != null ? Number(row.total) : null,
  }));
}
