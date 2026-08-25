import { env } from "./env.js";
import { durationToMs } from "../utils/time.js";

const maxAgeMs = durationToMs(env.JWT_EXPIRES_IN);

export const AUTH = {
  cookieName: "token",
  // jsonwebtoken expects seconds when passing a number
  tokenTtlSeconds: maxAgeMs / 1000,
  cookieMaxAgeMs: maxAgeMs,
} as const;
