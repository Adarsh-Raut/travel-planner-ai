import { Router } from "express";
import { isDatabaseConnected } from "../config/db.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    database: isDatabaseConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});
