import { Router } from "express";
import { listarEquipos } from "../lib/equipo";
import { crearVenta, obtenerVentaActiva } from "../lib/venta";
import { asyncHandler } from "../middleware/error";
import { idParamSchema } from "../lib/validation";

export const equiposRouter = Router();

equiposRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const equipos = await listarEquipos();
    res.json(equipos);
  }),
);

equiposRouter.get(
  "/:id/venta-activa",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const venta = await obtenerVentaActiva(id);
    if (!venta) {
      res.status(404).json({ error: "No hay venta activa para esta estación" });
      return;
    }
    res.json(venta);
  }),
);

equiposRouter.post(
  "/:id/ventas",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const existente = await obtenerVentaActiva(id);
    if (existente) {
      res.json(existente);
      return;
    }
    const venta = await crearVenta(id);
    res.status(201).json(venta);
  }),
);
