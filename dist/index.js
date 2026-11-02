"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./loadEnv");
const app_1 = require("./app");
const db_1 = require("./lib/db");
const port = Number(process.env.PORT ?? 3701);
const host = process.env.HOST ?? "0.0.0.0";
const app = (0, app_1.createApp)();
app.listen(port, host, () => {
    console.log(`Lancenter API escuchando en http://${host}:${port}`);
    console.log(`DATABASE_URL: ${(0, db_1.hasDatabaseUrl)() ? "configurada" : "FALTA (configura fly secrets)"}`);
});
process.on("unhandledRejection", (reason) => {
    console.error("unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
    console.error("uncaughtException:", err);
});
//# sourceMappingURL=index.js.map