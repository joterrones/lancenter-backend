"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equiposRouter = void 0;
const express_1 = require("express");
const equipo_1 = require("../lib/equipo");
const venta_1 = require("../lib/venta");
const error_1 = require("../middleware/error");
const validation_1 = require("../lib/validation");
exports.equiposRouter = (0, express_1.Router)();
exports.equiposRouter.get("/", (0, error_1.asyncHandler)(async (_req, res) => {
    const equipos = await (0, equipo_1.listarEquipos)();
    res.json(equipos);
}));
exports.equiposRouter.get("/:id/venta-activa", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const venta = await (0, venta_1.obtenerVentaActiva)(id);
    if (!venta) {
        res.status(404).json({ error: "No hay venta activa para esta estación" });
        return;
    }
    res.json(venta);
}));
exports.equiposRouter.post("/:id/ventas", (0, error_1.asyncHandler)(async (req, res) => {
    const { id } = validation_1.idParamSchema.parse(req.params);
    const existente = await (0, venta_1.obtenerVentaActiva)(id);
    if (existente) {
        res.json(existente);
        return;
    }
    const venta = await (0, venta_1.crearVenta)(id);
    res.status(201).json(venta);
}));
//# sourceMappingURL=equipos.js.map