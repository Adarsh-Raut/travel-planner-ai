import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { HttpError } from "../../utils/http-error.js";
import { GeminiProvider } from "./gemini.provider.js";
import { GroqProvider } from "./groq.provider.js";
import type { GenerationResult, LlmProvider, TripGenerationInput } from "./types.js";

export class FailoverLlmService {
  constructor(private readonly providers: LlmProvider[]) {}

  async generateTrip(input: TripGenerationInput): Promise<GenerationResult> {
    let lastProvider: string | null = null;

    for (const provider of this.providers) {
      lastProvider = provider.name;
      try {
        const trip = await provider.generateTrip(input);
        logger.info({ provider: provider.name }, "Trip generated");
        return { trip, servedBy: provider.name };
      } catch (err) {
        logger.warn(
          { provider: provider.name, err: err instanceof Error ? err.message : String(err) },
          "LLM provider failed, trying next",
        );
      }
    }

    logger.error({ attempted: lastProvider, count: this.providers.length }, "All LLM providers failed");
    throw new HttpError(
      502,
      "LLM_UNAVAILABLE",
      "Our AI travel agents are unavailable right now. Please try again in a moment.",
    );
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
