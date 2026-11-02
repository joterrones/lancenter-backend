import path from "path";
import dotenv from "dotenv";

export const backendRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.resolve(backendRoot, ".env") });
