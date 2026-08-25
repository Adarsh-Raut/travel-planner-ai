import type { Request, Response } from "express";
import { registerSchema } from "../validators/auth.validators.js";
import * as authService from "../services/auth.service.js";
import { parseBody } from "../utils/validation.js";

export async function register(req: Request, res: Response): Promise<void> {
  const dto = parseBody(registerSchema, req.body);
  const user = await authService.registerUser(dto);
  res.status(201).json({ data: { user } });
}
