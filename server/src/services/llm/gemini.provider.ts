import { GoogleGenAI, Type } from "@google/genai";
import { env } from "../../config/env.js";
import { ProviderError } from "./provider-error.js";
import { buildUserPrompt, SYSTEM_INSTRUCTION } from "./prompts.js";
import { generatedTripSchema, normalizeGeneratedTrip } from "./trip-schema.js";
import type { GeneratedTrip, LlmProvider, TripGenerationInput } from "./types.js";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    itinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          activities: {
            type: Type.ARRAY,
            minItems: 2,
            maxItems: 6,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["title", "description", "category"],
              propertyOrdering: ["title", "description", "category"],
            },
          },
        },
        required: ["day", "activities"],
        propertyOrdering: ["day", "activities"],
      },
    },
    budget: {
      type: Type.OBJECT,
      properties: {
        flights: { type: Type.NUMBER },
        accommodation: { type: Type.NUMBER },
        food: { type: Type.NUMBER },
        activities: { type: Type.NUMBER },
      },
      required: ["flights", "accommodation", "food", "activities"],
      propertyOrdering: ["flights", "accommodation", "food", "activities"],
    },
    hotels: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 3,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          tier: { type: Type.STRING, enum: ["budget", "mid_range", "luxury"] },
          note: { type: Type.STRING },
        },
        required: ["name", "tier", "note"],
        propertyOrdering: ["name", "tier", "note"],
      },
    },
  },
  required: ["itinerary", "budget", "hotels"],
  propertyOrdering: ["itinerary", "budget", "hotels"],
} as const;

export class GeminiProvider implements LlmProvider {
  readonly name = "gemini";

  private client: GoogleGenAI;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new ProviderError(this.name, "GEMINI_API_KEY is not configured");
    }
    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  async generateTrip(input: TripGenerationInput): Promise<GeneratedTrip> {
    try {
      const response = await this.client.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: buildUserPrompt(input),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.7,
          abortSignal: AbortSignal.timeout(45_000),
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error("Model returned an empty response");
      }

      const parsed = generatedTripSchema.parse(JSON.parse(rawText));
      return normalizeGeneratedTrip(parsed, input);
    } catch (err) {
      throw new ProviderError(this.name, describeError(err));
    }
  }
}

export function describeError(err: unknown): string {
  if (err instanceof SyntaxError) return "Response was not valid JSON";
  if (err instanceof Error && err.name === "ZodError") {
    return "Response did not match the trip schema";
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}
