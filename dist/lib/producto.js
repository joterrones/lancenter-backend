"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarTiposProducto = listarTiposProducto;
exports.listarProductos = listarProductos;
exports.obtenerProductoPorId = obtenerProductoPorId;
exports.crearProducto = crearProducto;
exports.actualizarProducto = actualizarProducto;
exports.eliminarProducto = eliminarProducto;
const db_1 = require("./db");
const error_1 = require("../middleware/error");
function mapProductoRow(row) {
    return {
        id: row.id,
        idTipoProducto: row.id_tipo_producto,
        codigo: row.codigo,
        nombre: row.nombre,
        precio: Number(row.precio),
        tieneVentas: row.tiene_ventas ?? undefined,
    };
}
async function listarTiposProducto() {
    const result = await db_1.pool.query("SELECT * FROM tipoproducto");
    return result.rows.map((row) => ({
        id: row.id,
        codigo: row.codigo,
        nombre: row.descripcion,
    }));
}
async function listarProductos(tipoProducto, buscar) {
    const result = await db_1.pool.query(`SELECT p.*,
            EXISTS(SELECT 1 FROM ventaproducto vp WHERE vp.id_producto = p.id) AS tiene_ventas
     FROM producto p
     WHERE ($1 = 0 OR p.id_tipo_producto = $1)
       AND upper(p.nombre) LIKE upper($2)
     ORDER BY p.nombre`, [tipoProducto, `%${buscar}%`]);
    return result.rows.map(mapProductoRow);
}
async function obtenerProductoPorId(id) {
    const result = await db_1.pool.query(`SELECT p.*,
            EXISTS(SELECT 1 FROM ventaproducto vp WHERE vp.id_producto = p.id) AS tiene_ventas
     FROM producto p
     WHERE p.id = $1`, [id]);
    if (result.rows.length === 0)
        return null;
    return mapProductoRow(result.rows[0]);
}
async function generarSiguienteCodigo() {
    const result = await db_1.pool.query(`
    SELECT COALESCE(
      MAX(
        CASE
          WHEN codigo ~ '^[0-9]+$' THEN CAST(codigo AS INTEGER)
          ELSE 0
        END
      ),
      0
    ) + 1 AS next
    FROM producto
  `);
    return String(result.rows[0].next).padStart(5, "0");
}
async function crearProducto(input) {
    const codigo = input.codigo?.trim() || (await generarSiguienteCodigo());
    const result = await db_1.pool.query(`INSERT INTO producto (id_tipo_producto, codigo, nombre, precio)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [input.idTipoProducto, codigo, input.nombre.trim(), input.precio]);
    return mapProductoRow({ ...result.rows[0], tiene_ventas: false });
}
async function actualizarProducto(id, input) {
    const actual = await obtenerProductoPorId(id);
    if (!actual)
        throw new error_1.HttpError(404, "Producto no encontrado");
    const codigo = input.codigo?.trim() || actual.codigo;
    const result = await db_1.pool.query(`UPDATE producto
     SET id_tipo_producto = $1, codigo = $2, nombre = $3, precio = $4
     WHERE id = $5
     RETURNING *`, [input.idTipoProducto, codigo, input.nombre.trim(), input.precio, id]);
    const producto = mapProductoRow(result.rows[0]);
    producto.tieneVentas = actual.tieneVentas;
    return producto;
}
async function eliminarProducto(id) {
    const actual = await obtenerProductoPorId(id);
    if (!actual)
        throw new error_1.HttpError(404, "Producto no encontrado");
    if (actual.tieneVentas) {
        throw new error_1.HttpError(409, "No se puede eliminar un producto que ya fue vendido");
    }
    await db_1.pool.query(`DELETE FROM producto WHERE id = $1`, [id]);
}
//# sourceMappingURL=producto.js.map