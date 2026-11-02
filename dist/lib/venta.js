"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sincronizarTotalesDesdeLineasPendientes = sincronizarTotalesDesdeLineasPendientes;
exports.obtenerVentaActiva = obtenerVentaActiva;
exports.crearVenta = crearVenta;
exports.obtenerVentaPorId = obtenerVentaPorId;
exports.iniciarVenta = iniciarVenta;
exports.pagarVenta = pagarVenta;
exports.actualizarComentario = actualizarComentario;
exports.actualizarEfectivo = actualizarEfectivo;
const db_1 = require("./db");
const error_1 = require("../middleware/error");
function mapVentaRow(row) {
    return {
        id: row.id,
        idEquipo: row.idequipo,
        pagado: row.pagado,
        codigoEquipo: row.codigo_equipo,
        totalHora: Number(row.total_hora ?? 0),
        totalProducto: Number(row.tota_producto ?? 0),
        total: Number(row.total ?? 0),
        fechaInicio: row.fecha_inicio ?? null,
        fechaFin: row.fecha_fin ?? null,
        restante: row.restante ?? null,
        comentario: row.comentario ?? null,
        acuenta: Number(row.acuenta ?? 0),
        vuelto: Number(row.vuelto ?? 0),
    };
}
async function sincronizarTotalesDesdeLineasPendientes(idVenta) {
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
        const result = await db_1.pool.query(sql, [idVenta]);
        return (result.rowCount ?? 0) > 0;
    }
    catch (err) {
        const pgErr = err;
        // Igual que ValetorPC: si faltan columnas total_* en venta, no fallar.
        if (pgErr.code === "42703") {
            return false;
        }
        throw err;
    }
}
async function obtenerVentaActiva(idEquipo) {
    const result = await db_1.pool.query(`SELECT * FROM v_venta WHERE idequipo = $1 AND pagado = 0 ORDER BY id DESC LIMIT 1`, [idEquipo]);
    if (result.rows.length === 0)
        return null;
    return mapVentaRow(result.rows[0]);
}
async function crearVenta(idEquipo) {
    const insert = await db_1.pool.query(`INSERT INTO venta (idequipo, pagado, fecha) VALUES ($1, 0, now()) RETURNING id, idequipo, pagado`, [idEquipo]);
    const row = insert.rows[0];
    const venta = await obtenerVentaPorId(row.id);
    if (!venta) {
        throw new error_1.HttpError(500, "No se pudo recuperar la venta creada");
    }
    return venta;
}
async function obtenerVentaPorId(id) {
    const result = await db_1.pool.query(`SELECT * FROM v_venta WHERE id = $1`, [id]);
    if (result.rows.length === 0)
        return null;
    return mapVentaRow(result.rows[0]);
}
async function iniciarVenta(id) {
    await db_1.pool.query(`UPDATE venta SET fecha_inicio = now() WHERE id = $1`, [id]);
    const venta = await obtenerVentaPorId(id);
    if (!venta)
        throw new error_1.HttpError(404, "Venta no encontrada");
    return venta;
}
async function pagarVenta(id) {
    await sincronizarTotalesDesdeLineasPendientes(id);
    await db_1.pool.query(`UPDATE venta SET pagado = 1 WHERE id = $1`, [id]);
    const venta = await obtenerVentaPorId(id);
    if (!venta)
        throw new error_1.HttpError(404, "Venta no encontrada");
    return venta;
}
async function actualizarComentario(id, comentario) {
    await db_1.pool.query(`UPDATE venta SET comentario = $1 WHERE id = $2`, [
        comentario,
        id,
    ]);
    const venta = await obtenerVentaPorId(id);
    if (!venta)
        throw new error_1.HttpError(404, "Venta no encontrada");
    return venta;
}
async function actualizarEfectivo(id, acuenta, vuelto) {
    await sincronizarTotalesDesdeLineasPendientes(id);
    await db_1.pool.query(`UPDATE venta SET acuenta = $1, vuelto = $2 WHERE id = $3`, [acuenta, vuelto, id]);
    const venta = await obtenerVentaPorId(id);
    if (!venta)
        throw new error_1.HttpError(404, "Venta no encontrada");
    return venta;
}
//# sourceMappingURL=venta.js.map