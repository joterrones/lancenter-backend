import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "../middleware/auth";
import { asyncHandler, HttpError } from "../middleware/error";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@lancenter.local").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
    const adminName = process.env.ADMIN_NAME ?? "Operador";

    if (email.toLowerCase() !== adminEmail) {
      throw new HttpError(401, "Correo o contraseña incorrectos");
    }

    const valid =
      password === adminPassword ||
      (adminPassword.startsWith("$2") &&
        (await bcrypt.compare(password, adminPassword)));
    if (!valid) {
      throw new HttpError(401, "Correo o contraseña incorrectos");
    }

    const user = { id: "admin", email: adminEmail, name: adminName };
    const token = signToken(user);
    res.json({ token, user });
  }),
);
