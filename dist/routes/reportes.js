"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportesRouter = void 0;
const express_1 = require("express");
const reporte_1 = require("../lib/reporte");
const error_1 = require("../middleware/error");
exports.reportesRouter = (0, express_1.Router)();
exports.reportesRouter.get("/ultimas-ventas", (0, error_1.asyncHandler)(async (_req, res) => {
    const ventas = await (0, reporte_1.ultimasVentas)();
    res.json(ventas);
}));
exports.reportesRouter.get("/resumen-diario", (0, error_1.asyncHandler)(async (_req, res) => {
    const resumen = await (0, reporte_1.resumenDiario)();
    res.json(resumen);
}));
//# sourceMappingURL=reportes.js.map