import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { GeneratedTrip, TripGenerationInput } from "./types.js";

const generatedActivitySchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(500),
  category: z.string().trim().min(1).max(40),
});

const generatedDaySchema = z.object({
  day: z.number().int().min(1),
  activities: z.array(generatedActivitySchema).min(2).max(6),
});

const generatedBudgetSchema = z.object({
  flights: z.number().min(0),
  accommodation: z.number().min(0),
  food: z.number().min(0),
  activities: z.number().min(0),
});

const generatedHotelSchema = z.object({
  name: z.string().trim().min(1).max(160),
  tier: z.enum(["budget", "mid_range", "luxury"]),
  note: z.string().trim().min(1).max(300),
});

export const generatedTripSchema = z.object({
  itinerary: z.array(generatedDaySchema).min(1).max(30),
  budget: generatedBudgetSchema,
  hotels: z.array(generatedHotelSchema).length(3),
});

export type RawGeneratedTrip = z.infer<typeof generatedTripSchema>;

export function normalizeGeneratedTrip(
  raw: RawGeneratedTrip,
  input: TripGenerationInput,
): GeneratedTrip {
  const days = [...raw.itinerary].sort((a, b) => a.day - b.day);

  const expectedDays = Array.from({ length: input.days }, (_, i) => i + 1);
  if (!days.every((d, index) => d.day === expectedDays[index])) {
    throw new Error(`Expected day numbers 1..${input.days} exactly once each`);
  }

  const { flights, accommodation, food, activities } = raw.budget;
  const total = Number((flights + accommodation + food + activities).toFixed(2));

  return {
    itinerary: days.map((d) => ({
      day: d.day,
      activities: d.activities.map((a) => ({ id: randomUUID(), ...a })),
    })),
    budget: {
      currency: "USD",
      flights,
      accommodation,
      food,
      activities,
      total,
    },
    hotels: raw.hotels,
  };
}
