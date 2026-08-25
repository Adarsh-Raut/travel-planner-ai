import type { ValidationIssue } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: ValidationIssue[];
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ValidationIssue[];

  constructor(status: number, code: string, message: string, details?: ValidationIssue[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const { error } = (body ?? {}) as ErrorBody;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      error?.message ?? "Something went wrong. Please try again.",
      error?.details,
    );
  }

  return body as T;
}

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  return parseResponse<T>(response);
}
