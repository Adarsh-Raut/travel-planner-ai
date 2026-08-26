import "dotenv/config";
import { GeminiProvider } from "../src/services/llm/gemini.provider.js";

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing from server/.env");
  process.exit(1);
}

const provider = new GeminiProvider();
const startedAt = Date.now();

try {
  const trip = await provider.generateTrip({
    destination: "Tokyo",
    days: 3,
    budgetType: "medium",
    interests: ["Food", "Culture"],
  });

  console.log(JSON.stringify(trip, null, 2));

  const activityCount = trip.itinerary.reduce(
    (sum, day) => sum + day.activities.length,
    0,
  );
  const componentSum =
    trip.budget.flights +
    trip.budget.accommodation +
    trip.budget.food +
    trip.budget.activities;

  console.log("\n--- checks ---");
  console.log(`days: ${trip.itinerary.length} (expected 3)`);
  console.log(`activities: ${activityCount}`);
  console.log(`budget total: ${trip.budget.total} (component sum: ${componentSum})`);
  console.log(`hotels: ${trip.hotels.map((h) => `${h.name} [${h.tier}]`).join(", ")}`);
  console.log(`served by: ${provider.name} in ${Date.now() - startedAt}ms`);
} catch (err) {
  console.error("Generation failed:", err);
  process.exit(1);
}
