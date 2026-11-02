"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogoRouter = void 0;
const express_1 = require("express");
const producto_1 = require("../lib/producto");
const error_1 = require("../middleware/error");
const validation_1 = require("../lib/validation");
exports.catalogoRouter = (0, express_1.Router)();
exports.catalogoRouter.get("/tipos-producto", (0, error_1.asyncHandler)(async (_req, res) => {
    const tipos = await (0, producto_1.listarTiposProducto)();
    res.json(tipos);
}));
exports.catalogoRouter.get("/productos", (0, error_1.asyncHandler)(async (req, res) => {
    const { tipo, buscar } = validation_1.productosQuerySchema.parse(req.query);
    const productos = await (0, producto_1.listarProductos)(tipo, buscar);
    res.json(productos);
}));
exports.catalogoRouter.get("/productos/:id", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const producto = await (0, producto_1.obtenerProductoPorId)(id);
    if (!producto)
        throw new error_1.HttpError(404, "Producto no encontrado");
    res.json(producto);
}));
exports.catalogoRouter.post("/productos", (0, error_1.asyncHandler)(async (req, res) => {
    const body = validation_1.productoBodySchema.parse(req.body);
    const producto = await (0, producto_1.crearProducto)(body);
    res.status(201).json(producto);
}));
exports.catalogoRouter.put("/productos/:id", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const body = validation_1.productoBodySchema.parse(req.body);
    const producto = await (0, producto_1.actualizarProducto)(id, body);
    res.json(producto);
}));
exports.catalogoRouter.delete("/productos/:id", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    await (0, producto_1.eliminarProducto)(id);
    res.status(204).send();
}));
//# sourceMappingURL=catalogo.js.map