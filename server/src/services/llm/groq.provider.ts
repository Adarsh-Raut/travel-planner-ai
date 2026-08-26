import Groq from "groq-sdk";
import { env } from "../../config/env.js";
import { ProviderError, describeProviderFailure } from "./provider-error.js";
import {
  buildDayPrompt,
  buildUserPrompt,
  DAY_JSON_CONTRACT,
  SYSTEM_INSTRUCTION,
  TRIP_JSON_CONTRACT,
} from "./prompts.js";
import {
  generatedDayResultSchema,
  generatedTripSchema,
  normalizeGeneratedDay,
  normalizeGeneratedTrip,
} from "./trip-schema.js";
import type {
  DayGenerationInput,
  GeneratedDay,
  GeneratedTrip,
  LlmProvider,
  TripGenerationInput,
} from "./types.js";

export class GroqProvider implements LlmProvider {
  readonly name = "groq";

  private client: Groq;

  constructor() {
    if (!env.GROQ_API_KEY) {
      throw new ProviderError(this.name, "GROQ_API_KEY is not configured");
    }
    this.client = new Groq({
      apiKey: env.GROQ_API_KEY,
      timeout: 45_000,
      maxRetries: 0,
    });
  }

  async generateTrip(input: TripGenerationInput): Promise<GeneratedTrip> {
    try {
      const completion = await this.client.chat.completions.create({
        model: env.GROQ_MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${SYSTEM_INSTRUCTION}\n\n${TRIP_JSON_CONTRACT}` },
          { role: "user", content: buildUserPrompt(input) },
        ],
      });

      const rawText = completion.choices[0]?.message?.content;
      if (!rawText) {
        throw new Error("Model returned an empty response");
      }

      const parsed = generatedTripSchema.parse(JSON.parse(rawText));
      return normalizeGeneratedTrip(parsed, input);
    } catch (err) {
      throw new ProviderError(this.name, `Trip generation failed: ${describeProviderFailure(err)}`);
    }
  }

  async generateDay(input: DayGenerationInput): Promise<GeneratedDay> {
    try {
      const completion = await this.client.chat.completions.create({
        model: env.GROQ_MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${SYSTEM_INSTRUCTION}\n\n${DAY_JSON_CONTRACT}` },
          { role: "user", content: buildDayPrompt(input) },
        ],
      });

      const rawText = completion.choices[0]?.message?.content;
      if (!rawText) {
        throw new Error("Model returned an empty response");
      }

      const parsed = generatedDayResultSchema.parse(JSON.parse(rawText));
      return normalizeGeneratedDay(parsed);
    } catch (err) {
      throw new ProviderError(this.name, `Day generation failed: ${describeProviderFailure(err)}`);
    }
  }
}
