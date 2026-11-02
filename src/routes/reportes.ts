import { Router } from "express";
import { resumenDiario, ultimasVentas } from "../lib/reporte";
import { asyncHandler } from "../middleware/error";

export const reportesRouter = Router();

reportesRouter.get(
  "/ultimas-ventas",
  asyncHandler(async (_req, res) => {
    const ventas = await ultimasVentas();
    res.json(ventas);
  }),
);

reportesRouter.get(
  "/resumen-diario",
  asyncHandler(async (_req, res) => {
    const resumen = await resumenDiario();
    res.json(resumen);
  }),
);
