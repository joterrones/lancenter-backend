"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
const zod_1 = require("zod");
class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.HttpError = HttpError;
function errorHandler(err, _req, res, _next) {
    if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: "Datos inválidos",
            details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        });
        return;
    }
    if (err instanceof SyntaxError) {
        res.status(400).json({ error: "JSON inválido" });
        return;
    }
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
}
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
//# sourceMappingURL=error.js.map