import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AUTH } from "../config/auth.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";
import * as authService from "../services/auth.service.js";
import { parseBody } from "../utils/validation.js";
import { HttpError } from "../utils/http-error.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  path: "/",
} as const;

export async function register(req: Request, res: Response): Promise<void> {
  const dto = parseBody(registerSchema, req.body);
  const user = await authService.registerUser(dto);
  res.status(201).json({ data: { user } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const dto = parseBody(loginSchema, req.body);
  const user = await authService.loginUser(dto);

  const token = jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, {
    expiresIn: AUTH.tokenTtlSeconds,
  });

  res.cookie(AUTH.cookieName, token, {
    ...COOKIE_OPTIONS,
    maxAge: AUTH.cookieMaxAgeMs,
  });
  res.json({ data: { user: authService.toPublicUser(user) } });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(AUTH.cookieName, { ...COOKIE_OPTIONS });
  res.json({ data: { success: true } });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    throw new HttpError(401, "UNAUTHORIZED", "Authentication required");
  }
  const user = await authService.getUserById(req.userId);
  if (!user) {
    // Account was deleted after the token was issued.
    throw new HttpError(401, "UNAUTHORIZED", "Account no longer exists");
  }
  res.json({ data: { user } });
}
