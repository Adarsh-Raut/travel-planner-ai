import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AUTH } from "../config/auth.js";
import { HttpError } from "../utils/http-error.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice("Bearer ".length);
  }

  if (!token) token = req.cookies?.[AUTH.cookieName];

  if (!token) {
    next(new HttpError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      throw new Error("Malformed token payload");
    }
    req.userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "UNAUTHORIZED", "Session is invalid or expired"));
  }
}
