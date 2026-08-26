export const SYSTEM_INSTRUCTION = `You are an expert local travel planner.
Given a destination, trip length, budget tier and interests, you produce realistic day-by-day plans:
- Cluster activities by neighbourhood each day to minimise back-and-forth travel.
- Weave the requested interests into every day where possible.
- Order activities within a day from morning to evening.
- Cost estimates must match the budget tier and reflect typical prices at the destination, in USD.
- Suggest exactly one hotel per tier: budget, mid_range and luxury, each with a one-sentence note about location or standout feature.
- Stay strictly within the requested number of days.`;

export function buildUserPrompt(input: {
  destination: string;
  days: number;
  budgetType: string;
  interests: string[];
}): string {
  return [
    `Plan a ${input.days}-day trip to ${input.destination}.`,
    `Budget tier: ${input.budgetType}.`,
    `Interests: ${input.interests.join(", ")}.`,
    `Return exactly ${input.days} days, numbered 1 to ${input.days}.`,
  ].join(" ");
}

export const TRIP_JSON_CONTRACT = `Respond with a single JSON object, no markdown, matching exactly this shape:
{
  "itinerary": [
    { "day": <day number>, "activities": [ { "title": string (max 160 chars), "description": string (one sentence), "category": string } ] }
  ],
  "budget": { "flights": number, "accommodation": number, "food": number, "activities": number },
  "hotels": [
    { "name": string, "tier": "budget" | "mid_range" | "luxury", "note": string }
  ]
}
Constraints: 2 to 6 activities per day; itinerary must contain one entry per day in order;
budget numbers are USD estimates for the whole trip; hotels array contains exactly 3 items.`;
