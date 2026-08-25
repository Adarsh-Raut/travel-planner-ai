import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(80).optional(),
  email: z.email("A valid email address is required").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.email("A valid email address is required").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
