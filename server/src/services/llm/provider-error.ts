export class ProviderError extends Error {
  readonly provider: string;

  constructor(provider: string, message: string) {
    super(`[${provider}] ${message}`);
    this.name = "ProviderError";
    this.provider = provider;
  }
}

export function describeProviderFailure(err: unknown): string {
  if (err instanceof SyntaxError) return "Response was not valid JSON";
  if (err instanceof Error && err.name === "ZodError") {
    return "Response did not match the expected schema";
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}
