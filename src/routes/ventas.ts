import { Router } from "express";
import {
  actualizarComentario,
  actualizarEfectivo,
  iniciarVenta,
  obtenerVentaPorId,
  pagarVenta,
  sincronizarTotalesDesdeLineasPendientes,
} from "../lib/venta";
import * as horaService from "../lib/ventaHora";
import * as productoLineaService from "../lib/ventaProducto";
import { asyncHandler, HttpError } from "../middleware/error";
import {
  comentarioBodySchema,
  efectivoBodySchema,
  horaBodySchema,
  idParamSchema,
  lineaIdParamSchema,
  nPagoBodySchema,
  productoLineaBodySchema,
} from "../lib/validation";

export const ventasRouter = Router();

ventasRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const venta = await obtenerVentaPorId(id);
    if (!venta) throw new HttpError(404, "Venta no encontrada");
    res.json(venta);
  }),
);

ventasRouter.get(
  "/:id/detalle",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const venta = await obtenerVentaPorId(id);
    if (!venta) throw new HttpError(404, "Venta no encontrada");
    const [horas, productos] = await Promise.all([
      horaService.listarHoras(id),
      productoLineaService.listarProductosVenta(id),
    ]);
    res.json({ venta, horas, productos });
  }),
);

ventasRouter.post(
  "/:id/iniciar",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const venta = await iniciarVenta(id);
    res.json(venta);
  }),
);

ventasRouter.post(
  "/:id/pagar",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const venta = await pagarVenta(id);
    res.json(venta);
  }),
);

ventasRouter.patch(
  "/:id/comentario",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const { comentario } = comentarioBodySchema.parse(req.body);
    const venta = await actualizarComentario(id, comentario);
    res.json(venta);
  }),
);

ventasRouter.patch(
  "/:id/efectivo",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const { acuenta, vuelto } = efectivoBodySchema.parse(req.body);
    const venta = await actualizarEfectivo(id, acuenta, vuelto);
    res.json(venta);
  }),
);

ventasRouter.post(
  "/:id/sincronizar-totales",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await sincronizarTotalesDesdeLineasPendientes(id);
    const venta = await obtenerVentaPorId(id);
    if (!venta) throw new HttpError(404, "Venta no encontrada");
    res.json(venta);
  }),
);

ventasRouter.get(
  "/:id/horas",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const horas = await horaService.listarHoras(id);
    res.json(horas);
  }),
);

ventasRouter.post(
  "/:id/horas",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const { hora, precio } = horaBodySchema.parse(req.body);
    const linea = await horaService.insertarHora(id, hora, precio);
    await sincronizarTotalesDesdeLineasPendientes(id);
    res.status(201).json(linea);
  }),
);

ventasRouter.delete(
  "/horas/:lineaId",
  asyncHandler(async (req, res) => {
    const { lineaId } = lineaIdParamSchema.parse(req.params);
    const idVenta = await horaService.eliminarHora(lineaId);
    if (idVenta) await sincronizarTotalesDesdeLineasPendientes(idVenta);
    res.status(204).send();
  }),
);

ventasRouter.patch(
  "/horas/:lineaId/n-pago",
  asyncHandler(async (req, res) => {
    const { lineaId } = lineaIdParamSchema.parse(req.params);
    const { nPago } = nPagoBodySchema.parse(req.body);
    const idVenta = await horaService.actualizarNPagoHora(lineaId, nPago);
    if (idVenta) await sincronizarTotalesDesdeLineasPendientes(idVenta);
    res.status(204).send();
  }),
);

ventasRouter.get(
  "/:id/productos",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const productos = await productoLineaService.listarProductosVenta(id);
    res.json(productos);
  }),
);

ventasRouter.post(
  "/:id/productos",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = productoLineaBodySchema.parse(req.body);
    const linea = await productoLineaService.insertarProducto(
      id,
      body.idProducto,
      body.cantidad,
      body.precio,
    );
    await sincronizarTotalesDesdeLineasPendientes(id);
    res.status(201).json(linea);
  }),
);

ventasRouter.delete(
  "/productos/:lineaId",
  asyncHandler(async (req, res) => {
    const { lineaId } = lineaIdParamSchema.parse(req.params);
    const idVenta = await productoLineaService.eliminarProducto(lineaId);
    if (idVenta) await sincronizarTotalesDesdeLineasPendientes(idVenta);
    res.status(204).send();
  }),
);

ventasRouter.patch(
  "/productos/:lineaId/n-pago",
  asyncHandler(async (req, res) => {
    const { lineaId } = lineaIdParamSchema.parse(req.params);
    const { nPago } = nPagoBodySchema.parse(req.body);
    const idVenta = await productoLineaService.actualizarNPagoProducto(
      lineaId,
      nPago,
    );
    if (idVenta) await sincronizarTotalesDesdeLineasPendientes(idVenta);
    res.status(204).send();
  }),
);
