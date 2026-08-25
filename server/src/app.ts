import express, { type Express } from "express";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: "1mb" }));

  app.use("/health", healthRouter);
  app.use("/api/auth", authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
