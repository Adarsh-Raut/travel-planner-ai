import { GoogleGenAI, Type } from "@google/genai";
import { env } from "../../config/env.js";
import { ProviderError, describeProviderFailure } from "./provider-error.js";
import {
  buildDayPrompt,
  buildUserPrompt,
  SYSTEM_INSTRUCTION,
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

const ACTIVITY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    category: { type: Type.STRING },
  },
  required: ["title", "description", "category"],
  propertyOrdering: ["title", "description", "category"],
};

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
            items: ACTIVITY_SCHEMA,
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

const DAY_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    activities: {
      type: Type.ARRAY,
      minItems: 2,
      maxItems: 6,
      items: ACTIVITY_SCHEMA,
    },
  },
  required: ["activities"],
  propertyOrdering: ["activities"],
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
      throw new ProviderError(this.name, `Trip generation failed: ${describeProviderFailure(err)}`);
    }
  }

  async generateDay(input: DayGenerationInput): Promise<GeneratedDay> {
    try {
      const response = await this.client.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: buildDayPrompt(input),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: DAY_RESPONSE_SCHEMA,
          temperature: 0.7,
          abortSignal: AbortSignal.timeout(45_000),
        },
      });

      const rawText = response.text;
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
