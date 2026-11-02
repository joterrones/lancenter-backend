"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productoBodySchema = exports.productosQuerySchema = exports.nPagoBodySchema = exports.productoLineaBodySchema = exports.horaBodySchema = exports.efectivoBodySchema = exports.comentarioBodySchema = exports.lineaIdParamSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive(),
});
exports.lineaIdParamSchema = zod_1.z.object({
    lineaId: zod_1.z.coerce.number().int().positive(),
});
exports.comentarioBodySchema = zod_1.z.object({
    comentario: zod_1.z.string().max(500),
});
exports.efectivoBodySchema = zod_1.z.object({
    acuenta: zod_1.z.coerce.number().min(0),
    vuelto: zod_1.z.coerce.number().min(0),
});
exports.horaBodySchema = zod_1.z.object({
    hora: zod_1.z.coerce.number().positive(),
    precio: zod_1.z.coerce.number().min(0),
});
exports.productoLineaBodySchema = zod_1.z.object({
    idProducto: zod_1.z.coerce.number().int().positive(),
    cantidad: zod_1.z.coerce.number().int().positive(),
    precio: zod_1.z.coerce.number().min(0),
});
exports.nPagoBodySchema = zod_1.z.object({
    nPago: zod_1.z.coerce.number().int().min(0).max(1),
});
exports.productosQuerySchema = zod_1.z.object({
    tipo: zod_1.z.coerce.number().int().min(0).default(0),
    buscar: zod_1.z.string().default(""),
});
exports.productoBodySchema = zod_1.z.object({
    idTipoProducto: zod_1.z.coerce.number().int().positive(),
    codigo: zod_1.z.string().max(50).optional(),
    nombre: zod_1.z.string().min(1).max(200),
    precio: zod_1.z.coerce.number().min(0),
});
//# sourceMappingURL=validation.js.map