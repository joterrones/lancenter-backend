"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const error_1 = require("./middleware/error");
const db_1 = require("./lib/db");
const auth_2 = require("./routes/auth");
const equipos_1 = require("./routes/equipos");
const ventas_1 = require("./routes/ventas");
const catalogo_1 = require("./routes/catalogo");
const reportes_1 = require("./routes/reportes");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.get("/", (_req, res) => {
        res.json({
            ok: true,
            name: "Lancenter API",
            health: "/health",
            ready: "/ready",
            auth: "POST /auth/login",
        });
    });
    // Siempre responde 200 para que Fly marque la máquina sana.
    app.get("/health", (_req, res) => {
        res.json({
            ok: true,
            name: "Lancenter API",
            databaseConfigured: (0, db_1.hasDatabaseUrl)(),
        });
    });
    app.get("/ready", async (_req, res) => {
        const db = await (0, db_1.checkDatabase)();
        const status = db.ok ? 200 : 503;
        res.status(status).json({
            ok: db.ok,
            name: "Lancenter API",
            database: db,
        });
    });
    app.use("/auth", auth_2.authRouter);
    app.use("/equipos", auth_1.auth, equipos_1.equiposRouter);
    app.use("/ventas", auth_1.auth, ventas_1.ventasRouter);
    app.use(auth_1.auth, catalogo_1.catalogoRouter);
    app.use("/reportes", auth_1.auth, reportes_1.reportesRouter);
    app.use(error_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map