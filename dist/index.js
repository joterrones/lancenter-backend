"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./loadEnv");
const app_1 = require("./app");
const port = Number(process.env.PORT ?? 3700);
const host = process.env.HOST ?? "0.0.0.0";
const app = (0, app_1.createApp)();
app.listen(port, host, () => {
    console.log(`Lancenter API escuchando en http://${host}:${port}`);
});
//# sourceMappingURL=index.js.map