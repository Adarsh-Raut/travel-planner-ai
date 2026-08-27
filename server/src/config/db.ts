import mongoose from "mongoose";
import { logger } from "./logger.js";

mongoose.set("strictQuery", true);

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected cleanly");
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
