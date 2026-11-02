import { Router } from "express";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
  listarTiposProducto,
  obtenerProductoPorId,
} from "../lib/producto";
import { asyncHandler, HttpError } from "../middleware/error";
import {
  idParamSchema,
  productoBodySchema,
  productosQuerySchema,
} from "../lib/validation";

export const catalogoRouter = Router();

catalogoRouter.get(
  "/tipos-producto",
  asyncHandler(async (_req, res) => {
    const tipos = await listarTiposProducto();
    res.json(tipos);
  }),
);

catalogoRouter.get(
  "/productos",
  asyncHandler(async (req, res) => {
    const { tipo, buscar } = productosQuerySchema.parse(req.query);
    const productos = await listarProductos(tipo, buscar);
    res.json(productos);
  }),
);

catalogoRouter.get(
  "/productos/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const producto = await obtenerProductoPorId(id);
    if (!producto) throw new HttpError(404, "Producto no encontrado");
    res.json(producto);
  }),
);

catalogoRouter.post(
  "/productos",
  asyncHandler(async (req, res) => {
    const body = productoBodySchema.parse(req.body);
    const producto = await crearProducto(body);
    res.status(201).json(producto);
  }),
);

catalogoRouter.put(
  "/productos/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = productoBodySchema.parse(req.body);
    const producto = await actualizarProducto(id, body);
    res.json(producto);
  }),
);

catalogoRouter.delete(
  "/productos/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await eliminarProducto(id);
    res.status(204).send();
  }),
);
