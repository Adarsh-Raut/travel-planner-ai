import type { ZodType } from "zod";
import { HttpError } from "./http-error.js";

interface ValidationIssue {
  path: string;
  message: string;
}

export function parseBody<T>(schema: ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const issues: ValidationIssue[] = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    throw new HttpError(422, "VALIDATION_ERROR", "Invalid input data", issues);
  }

  return result.data;
}
