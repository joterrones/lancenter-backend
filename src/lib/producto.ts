import { pool } from "./db";
import { HttpError } from "../middleware/error";
import type { Producto, TipoProducto } from "../types";

function mapProductoRow(row: {
  id: number;
  id_tipo_producto: number;
  codigo: string;
  nombre: string;
  precio: string | number;
  tiene_ventas?: boolean;
}): Producto {
  return {
    id: row.id,
    idTipoProducto: row.id_tipo_producto,
    codigo: row.codigo,
    nombre: row.nombre,
    precio: Number(row.precio),
    tieneVentas: row.tiene_ventas ?? undefined,
  };
}

export async function listarTiposProducto(): Promise<TipoProducto[]> {
  const result = await pool.query("SELECT * FROM tipoproducto");
  return result.rows.map((row) => ({
    id: row.id,
    codigo: row.codigo,
    nombre: row.descripcion,
  }));
}

export async function listarProductos(
  tipoProducto: number,
  buscar: string,
): Promise<Producto[]> {
  const result = await pool.query(
    `SELECT p.*,
            EXISTS(SELECT 1 FROM ventaproducto vp WHERE vp.id_producto = p.id) AS tiene_ventas
     FROM producto p
     WHERE ($1 = 0 OR p.id_tipo_producto = $1)
       AND upper(p.nombre) LIKE upper($2)
     ORDER BY p.nombre`,
    [tipoProducto, `%${buscar}%`],
  );

  return result.rows.map(mapProductoRow);
}

export async function obtenerProductoPorId(id: number): Promise<Producto | null> {
  const result = await pool.query(
    `SELECT p.*,
            EXISTS(SELECT 1 FROM ventaproducto vp WHERE vp.id_producto = p.id) AS tiene_ventas
     FROM producto p
     WHERE p.id = $1`,
    [id],
  );
  if (result.rows.length === 0) return null;
  return mapProductoRow(result.rows[0]);
}

async function generarSiguienteCodigo(): Promise<string> {
  const result = await pool.query(`
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

export async function crearProducto(input: {
  idTipoProducto: number;
  codigo?: string;
  nombre: string;
  precio: number;
}): Promise<Producto> {
  const codigo = input.codigo?.trim() || (await generarSiguienteCodigo());
  const result = await pool.query(
    `INSERT INTO producto (id_tipo_producto, codigo, nombre, precio)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.idTipoProducto, codigo, input.nombre.trim(), input.precio],
  );
  return mapProductoRow({ ...result.rows[0], tiene_ventas: false });
}

export async function actualizarProducto(
  id: number,
  input: {
    idTipoProducto: number;
    codigo?: string;
    nombre: string;
    precio: number;
  },
): Promise<Producto> {
  const actual = await obtenerProductoPorId(id);
  if (!actual) throw new HttpError(404, "Producto no encontrado");

  const codigo = input.codigo?.trim() || actual.codigo;
  const result = await pool.query(
    `UPDATE producto
     SET id_tipo_producto = $1, codigo = $2, nombre = $3, precio = $4
     WHERE id = $5
     RETURNING *`,
    [input.idTipoProducto, codigo, input.nombre.trim(), input.precio, id],
  );
  const producto = mapProductoRow(result.rows[0]);
  producto.tieneVentas = actual.tieneVentas;
  return producto;
}

export async function eliminarProducto(id: number): Promise<void> {
  const actual = await obtenerProductoPorId(id);
  if (!actual) throw new HttpError(404, "Producto no encontrado");
  if (actual.tieneVentas) {
    throw new HttpError(
      409,
      "No se puede eliminar un producto que ya fue vendido",
    );
  }
  await pool.query(`DELETE FROM producto WHERE id = $1`, [id]);
}
