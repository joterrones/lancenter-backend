"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
exports.authRouter = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.authRouter.post("/login", (0, error_1.asyncHandler)(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@lancenter.local").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
    const adminName = process.env.ADMIN_NAME ?? "Operador";
    if (email.toLowerCase() !== adminEmail) {
        throw new error_1.HttpError(401, "Correo o contraseña incorrectos");
    }
    const valid = password === adminPassword ||
        (adminPassword.startsWith("$2") &&
            (await bcryptjs_1.default.compare(password, adminPassword)));
    if (!valid) {
        throw new error_1.HttpError(401, "Correo o contraseña incorrectos");
    }
    const user = { id: "admin", email: adminEmail, name: adminName };
    const token = (0, auth_1.signToken)(user);
    res.json({ token, user });
}));
//# sourceMappingURL=auth.js.map