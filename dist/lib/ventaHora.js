"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarHoras = listarHoras;
exports.insertarHora = insertarHora;
exports.eliminarHora = eliminarHora;
exports.actualizarNPagoHora = actualizarNPagoHora;
const db_1 = require("./db");
async function listarHoras(idVenta) {
    const result = await db_1.pool.query(`
    SELECT v.id, v.id_venta, v.hora, v.hora_text, v.precio, COALESCE(h.n_pago, 0) AS n_pago
    FROM v_horagrilla v
    INNER JOIN ventahora h ON h.id = v.id
    WHERE v.id_venta = $1
    ORDER BY v.id DESC
    `, [idVenta]);
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
async function insertarHora(idVenta, hora, precio) {
    const result = await db_1.pool.query(`INSERT INTO ventahora (id_venta, hora, precio, pagado, n_pago)
     VALUES ($1, $2, $3, 0, 0) RETURNING id, id_venta, hora, precio, pagado, n_pago`, [idVenta, hora, precio]);
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
async function eliminarHora(lineaId) {
    const result = await db_1.pool.query(`DELETE FROM ventahora WHERE id = $1 RETURNING id_venta`, [lineaId]);
    return result.rows[0]?.id_venta ?? null;
}
async function actualizarNPagoHora(lineaId, nPago) {
    const result = await db_1.pool.query(`UPDATE ventahora SET n_pago = $1 WHERE id = $2 RETURNING id_venta`, [nPago, lineaId]);
    return result.rows[0]?.id_venta ?? null;
}
//# sourceMappingURL=ventaHora.js.map