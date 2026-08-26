import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { tripRouter } from "./routes/trip.routes.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { logger } from "./config/logger.js";
import { env } from "./config/env.js";

export function createApp(): Express {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      redact: {
        paths: ["req.headers.cookie", "req.headers.authorization", "req.body.password"],
        censor: "[REDACTED]",
      },
      autoLogging: {
        ignore: (req) => req.url === "/health",
      },
    }),
  );

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/trips", tripRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
