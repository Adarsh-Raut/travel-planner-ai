import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

mongoose.set("strictQuery", true);

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err.message);
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
