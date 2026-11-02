"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarEquipos = listarEquipos;
const db_1 = require("./db");
async function listarEquipos() {
    const result = await db_1.pool.query("SELECT * FROM v_equipo2 ORDER BY id");
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
//# sourceMappingURL=equipo.js.map