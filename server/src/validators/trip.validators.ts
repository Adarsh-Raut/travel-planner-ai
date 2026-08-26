import { z } from "zod";

export const createTripSchema = z.object({
  destination: z.string().trim().min(1, "Destination is required").max(100),
  days: z.coerce
    .number()
    .int("Days must be a whole number")
    .min(1, "Trips need at least 1 day")
    .max(30, "Trips are capped at 30 days"),
  budgetType: z.enum(["low", "medium", "high"], "Budget must be low, medium or high"),
  interests: z
    .array(z.string().trim().min(1).max(40))
    .min(1, "Pick at least one interest")
    .max(8, "At most 8 interests")
    .transform((items) => [...new Set(items)]),
  title: z.string().trim().max(120).optional(),
});

export type CreateTripDto = z.infer<typeof createTripSchema>;
