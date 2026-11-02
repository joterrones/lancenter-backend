import express from "express";
import cors from "cors";
import { auth } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import { checkDatabase, hasDatabaseUrl } from "./lib/db";
import { authRouter } from "./routes/auth";
import { equiposRouter } from "./routes/equipos";
import { ventasRouter } from "./routes/ventas";
import { catalogoRouter } from "./routes/catalogo";
import { reportesRouter } from "./routes/reportes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

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
      databaseConfigured: hasDatabaseUrl(),
    });
  });

  app.get("/ready", async (_req, res) => {
    const db = await checkDatabase();
    const status = db.ok ? 200 : 503;
    res.status(status).json({
      ok: db.ok,
      name: "Lancenter API",
      database: db,
    });
  });

  app.use("/auth", authRouter);

  app.use("/equipos", auth, equiposRouter);
  app.use("/ventas", auth, ventasRouter);
  app.use(auth, catalogoRouter);
  app.use("/reportes", auth, reportesRouter);

  app.use(errorHandler);
  return app;
}
