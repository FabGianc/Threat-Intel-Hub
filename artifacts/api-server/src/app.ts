import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

// Il frontend chiama /api dalla stessa origine (proxy Vite in locale,
// router su Replit): CORS serve solo se impostato esplicitamente
const corsOrigins = (process.env["CORS_ORIGINS"] ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: corsOrigins.length > 0 ? corsOrigins : false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
