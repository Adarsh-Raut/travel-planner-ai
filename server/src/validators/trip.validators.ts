import { z } from "zod";

const tripInputFields = {
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
} as const;

export const createTripSchema = z.object({
  ...tripInputFields,
  title: z.string().trim().max(120).optional(),
});

export const updateTripSchema = z
  .object({
    destination: tripInputFields.destination.optional(),
    days: tripInputFields.days.optional(),
    budgetType: tripInputFields.budgetType.optional(),
    interests: tripInputFields.interests.optional(),
    title: z.string().trim().max(120).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export type CreateTripDto = z.infer<typeof createTripSchema>;
export type UpdateTripDto = z.infer<typeof updateTripSchema>;

export const regenerateDaySchema = z.object({
  instruction: z
    .string()
    .trim()
    .min(1, "Instruction cannot be empty")
    .max(300, "Instruction must be 300 characters or fewer")
    .optional(),
});

export type RegenerateDayDto = z.infer<typeof regenerateDaySchema>;
