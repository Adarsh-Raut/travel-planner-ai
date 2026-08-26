import { GoogleGenAI, Type } from "@google/genai";
import { env } from "../../config/env.js";
import { ProviderError } from "./provider-error.js";
import { generatedTripSchema, normalizeGeneratedTrip } from "./trip-schema.js";
import type { GeneratedTrip, LlmProvider, TripGenerationInput } from "./types.js";

const SYSTEM_INSTRUCTION = `You are an expert local travel planner.
Given a destination, trip length, budget tier and interests, you produce realistic day-by-day plans:
- Cluster activities by neighbourhood each day to minimise back-and-forth travel.
- Weave the requested interests into every day where possible.
- Order activities within a day from morning to evening.
- Cost estimates must match the budget tier and reflect typical prices at the destination, in USD.
- Suggest exactly one hotel per tier: budget, mid_range and luxury, each with a one-sentence note about location or standout feature.
- Stay strictly within the requested number of days.`;

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

function buildUserPrompt(input: TripGenerationInput): string {
  return [
    `Plan a ${input.days}-day trip to ${input.destination}.`,
    `Budget tier: ${input.budgetType}.`,
    `Interests: ${input.interests.join(", ")}.`,
    `Return exactly ${input.days} days, numbered 1 to ${input.days}.`,
  ].join(" ");
}

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
      const detail = err instanceof SyntaxError
        ? "Response was not valid JSON"
        : err instanceof Error && err.name === "ZodError"
          ? "Response did not match the trip schema"
          : err instanceof Error
            ? err.message
            : "Unknown error";
      throw new ProviderError(this.name, `Trip generation failed: ${detail}`);
    }
  }
}
