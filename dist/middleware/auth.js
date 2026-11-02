"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function signToken(user) {
    const secret = process.env.JWT_SECRET?.trim() || "lancenter-dev-secret";
    const expiresIn = process.env.JWT_EXPIRES_IN?.trim() || "7d";
    return jsonwebtoken_1.default.sign(user, secret, {
        expiresIn: expiresIn,
    });
}
function auth(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
        res.status(401).json({ error: "No autorizado" });
        return;
    }
    const secret = process.env.JWT_SECRET?.trim() || "lancenter-dev-secret";
    try {
        req.user = jsonwebtoken_1.default.verify(token, secret);
        next();
    }
    catch {
        res.status(401).json({ error: "Token inválido" });
    }
}
//# sourceMappingURL=auth.js.map