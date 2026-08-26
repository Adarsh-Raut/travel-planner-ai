import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { HttpError } from "../../utils/http-error.js";
import { GeminiProvider } from "./gemini.provider.js";
import { GroqProvider } from "./groq.provider.js";
import type {
  DayGenerationInput,
  GenerationResult,
  GeneratedDay,
  LlmProvider,
  TripGenerationInput,
} from "./types.js";

const PROVIDERS_UNAVAILABLE = new HttpError(
  502,
  "LLM_UNAVAILABLE",
  "Our AI travel agents are unavailable right now. Please try again in a moment.",
);

export class FailoverLlmService {
  constructor(private readonly providers: LlmProvider[]) {}

  private async attempt<T>(
    label: string,
    operation: (provider: LlmProvider) => Promise<T>,
  ): Promise<{ result: T; servedBy: string }> {
    let lastProvider: string | null = null;

    for (const provider of this.providers) {
      lastProvider = provider.name;
      try {
        const result = await operation(provider);
        logger.info({ provider: provider.name }, `${label} succeeded`);
        return { result, servedBy: provider.name };
      } catch (err) {
        logger.warn(
          { provider: provider.name, err: err instanceof Error ? err.message : String(err) },
          "LLM provider failed, trying next",
        );
      }
    }

    logger.error(
      { attempted: lastProvider, count: this.providers.length },
      `All LLM providers failed for ${label}`,
    );
    throw PROVIDERS_UNAVAILABLE;
  }

  async generateTrip(input: TripGenerationInput): Promise<GenerationResult> {
    const { result, servedBy } = await this.attempt("Trip generation", (provider) =>
      provider.generateTrip(input),
    );
    return { trip: result, servedBy };
  }

  async generateDay(
    input: DayGenerationInput,
  ): Promise<{ result: GeneratedDay; servedBy: string }> {
    return this.attempt("Day generation", (provider) => provider.generateDay(input));
  }
}

export function createLlmService(): FailoverLlmService {
  const providers: LlmProvider[] = [];

  if (env.GEMINI_API_KEY) providers.push(new GeminiProvider());
  if (env.GROQ_API_KEY) providers.push(new GroqProvider());

  if (providers.length === 0) {
    throw new Error("No LLM providers configured. Set GEMINI_API_KEY and/or GROQ_API_KEY.");
  }

  return new FailoverLlmService(providers);
}

export const llmService = createLlmService();
