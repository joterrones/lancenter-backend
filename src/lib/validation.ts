import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const lineaIdParamSchema = z.object({
  lineaId: z.coerce.number().int().positive(),
});

export const comentarioBodySchema = z.object({
  comentario: z.string().max(500),
});

export const efectivoBodySchema = z.object({
  acuenta: z.coerce.number().min(0),
  vuelto: z.coerce.number().min(0),
});

export const horaBodySchema = z.object({
  hora: z.coerce.number().positive(),
  precio: z.coerce.number().min(0),
});

export const productoLineaBodySchema = z.object({
  idProducto: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().positive(),
  precio: z.coerce.number().min(0),
});

export const nPagoBodySchema = z.object({
  nPago: z.coerce.number().int().min(0).max(1),
});

export const productosQuerySchema = z.object({
  tipo: z.coerce.number().int().min(0).default(0),
  buscar: z.string().default(""),
});

export const productoBodySchema = z.object({
  idTipoProducto: z.coerce.number().int().positive(),
  codigo: z.string().max(50).optional(),
  nombre: z.string().min(1).max(200),
  precio: z.coerce.number().min(0),
});
