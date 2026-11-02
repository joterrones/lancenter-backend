import express from "express";
import cors from "cors";
import { auth } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import { authRouter } from "./routes/auth";
import { equiposRouter } from "./routes/equipos";
import { ventasRouter } from "./routes/ventas";
import { catalogoRouter } from "./routes/catalogo";
import { reportesRouter } from "./routes/reportes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, name: "Lancenter API" });
  });

  app.use("/auth", authRouter);

  app.use("/equipos", auth, equiposRouter);
  app.use("/ventas", auth, ventasRouter);
  app.use(auth, catalogoRouter);
  app.use("/reportes", auth, reportesRouter);

  app.use(errorHandler);
  return app;
}
