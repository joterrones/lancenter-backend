"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ventasRouter = void 0;
const express_1 = require("express");
const venta_1 = require("../lib/venta");
const horaService = __importStar(require("../lib/ventaHora"));
const productoLineaService = __importStar(require("../lib/ventaProducto"));
const error_1 = require("../middleware/error");
const validation_1 = require("../lib/validation");
exports.ventasRouter = (0, express_1.Router)();
exports.ventasRouter.get("/:id", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const venta = await (0, venta_1.obtenerVentaPorId)(id);
    if (!venta)
        throw new error_1.HttpError(404, "Venta no encontrada");
    res.json(venta);
}));
exports.ventasRouter.get("/:id/detalle", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const venta = await (0, venta_1.obtenerVentaPorId)(id);
    if (!venta)
        throw new error_1.HttpError(404, "Venta no encontrada");
    const [horas, productos] = await Promise.all([
        horaService.listarHoras(id),
        productoLineaService.listarProductosVenta(id),
    ]);
    res.json({ venta, horas, productos });
}));
exports.ventasRouter.post("/:id/iniciar", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const venta = await (0, venta_1.iniciarVenta)(id);
    res.json(venta);
}));
exports.ventasRouter.post("/:id/pagar", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const venta = await (0, venta_1.pagarVenta)(id);
    res.json(venta);
}));
exports.ventasRouter.patch("/:id/comentario", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const { comentario } = validation_1.comentarioBodySchema.parse(req.body);
    const venta = await (0, venta_1.actualizarComentario)(id, comentario);
    res.json(venta);
}));
exports.ventasRouter.patch("/:id/efectivo", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const { acuenta, vuelto } = validation_1.efectivoBodySchema.parse(req.body);
    const venta = await (0, venta_1.actualizarEfectivo)(id, acuenta, vuelto);
    res.json(venta);
}));
exports.ventasRouter.post("/:id/sincronizar-totales", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    await (0, venta_1.sincronizarTotalesDesdeLineasPendientes)(id);
    const venta = await (0, venta_1.obtenerVentaPorId)(id);
    if (!venta)
        throw new error_1.HttpError(404, "Venta no encontrada");
    res.json(venta);
}));
exports.ventasRouter.get("/:id/horas", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const horas = await horaService.listarHoras(id);
    res.json(horas);
}));
exports.ventasRouter.post("/:id/horas", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const { hora, precio } = validation_1.horaBodySchema.parse(req.body);
    const linea = await horaService.insertarHora(id, hora, precio);
    await (0, venta_1.sincronizarTotalesDesdeLineasPendientes)(id);
    res.status(201).json(linea);
}));
exports.ventasRouter.delete("/horas/:lineaId", (0, error_1.asyncHandler)(async (req, res) => {
    const { lineaId } = validation_1.lineaIdParamSchema.parse(req.params);
    const idVenta = await horaService.eliminarHora(lineaId);
    if (idVenta)
        await (0, venta_1.sincronizarTotalesDesdeLineasPendientes)(idVenta);
    res.status(204).send();
}));
exports.ventasRouter.patch("/horas/:lineaId/n-pago", (0, error_1.asyncHandler)(async (req, res) => {
    const { lineaId } = validation_1.lineaIdParamSchema.parse(req.params);
    const { nPago } = validation_1.nPagoBodySchema.parse(req.body);
    const idVenta = await horaService.actualizarNPagoHora(lineaId, nPago);
    if (idVenta)
        await (0, venta_1.sincronizarTotalesDesdeLineasPendientes)(idVenta);
    res.status(204).send();
}));
exports.ventasRouter.get("/:id/productos", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const productos = await productoLineaService.listarProductosVenta(id);
    res.json(productos);
}));
exports.ventasRouter.post("/:id/productos", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const body = validation_1.productoLineaBodySchema.parse(req.body);
    const linea = await productoLineaService.insertarProducto(id, body.idProducto, body.cantidad, body.precio);
    await (0, venta_1.sincronizarTotalesDesdeLineasPendientes)(id);
    res.status(201).json(linea);
}));
exports.ventasRouter.delete("/productos/:lineaId", (0, error_1.asyncHandler)(async (req, res) => {
    const { lineaId } = validation_1.lineaIdParamSchema.parse(req.params);
    const idVenta = await productoLineaService.eliminarProducto(lineaId);
    if (idVenta)
        await (0, venta_1.sincronizarTotalesDesdeLineasPendientes)(idVenta);
    res.status(204).send();
}));
exports.ventasRouter.patch("/productos/:lineaId/n-pago", (0, error_1.asyncHandler)(async (req, res) => {
    const { lineaId } = validation_1.lineaIdParamSchema.parse(req.params);
    const { nPago } = validation_1.nPagoBodySchema.parse(req.body);
    const idVenta = await productoLineaService.actualizarNPagoProducto(lineaId, nPago);
    if (idVenta)
        await (0, venta_1.sincronizarTotalesDesdeLineasPendientes)(idVenta);
    res.status(204).send();
}));
//# sourceMappingURL=ventas.js.map