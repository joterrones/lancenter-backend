import "./loadEnv";
import { createApp } from "./app";
import { hasDatabaseUrl } from "./lib/db";

const port = Number(process.env.PORT ?? 3701);
const host = process.env.HOST ?? "0.0.0.0";

const app = createApp();

app.listen(port, host, () => {
  console.log(`Lancenter API escuchando en http://${host}:${port}`);
  console.log(
    `DATABASE_URL: ${hasDatabaseUrl() ? "configurada" : "FALTA (configura fly secrets)"}`,
  );
});

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
});
