import "dotenv/config";
import { FailoverLlmService } from "../src/services/llm/orchestrator.js";
import { GroqProvider } from "../src/services/llm/groq.provider.js";
import { GeminiProvider } from "../src/services/llm/gemini.provider.js";
import { ProviderError } from "../src/services/llm/provider-error.js";
import type { LlmProvider, TripGenerationInput } from "../src/services/llm/types.js";

if (!process.env.GEMINI_API_KEY || !process.env.GROQ_API_KEY) {
  console.error("Both GEMINI_API_KEY and GROQ_API_KEY must be set in server/.env");
  process.exit(1);
}

const INPUT: TripGenerationInput = {
  destination: "Lisbon",
  days: 2,
  budgetType: "low",
  interests: ["Food", "Culture"],
};

function failingProvider(name: string): LlmProvider {
  return {
    name,
    async generateTrip() {
      throw new ProviderError(name, "Simulated outage");
    },
  };
}

async function scenario(label: string, service: FailoverLlmService) {
  const startedAt = Date.now();
  try {
    const result = await service.generateTrip(INPUT);
    console.log(
      `[${label}] OK — servedBy=${result.servedBy} days=${result.trip.itinerary.length} total=$${result.trip.budget.total} (${Date.now() - startedAt}ms)`,
    );
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`[${label}] ERROR — ${message} (${Date.now() - startedAt}ms)`);
    return false;
  }
}

console.log("--- failover scenarios ---\n");

const normal = new FailoverLlmService([new GeminiProvider(), new GroqProvider()]);
const geminiDown = new FailoverLlmService([failingProvider("gemini-simulated-outage"), new GroqProvider()]);
const allDown = new FailoverLlmService([
  failingProvider("fake-a"),
  failingProvider("fake-b"),
]);

const results = [
  await scenario("1. healthy chain (gemini -> groq)", normal),
  await scenario("2. gemini fails, groq catches", geminiDown),
  await scenario("3. everything down", allDown),
];

// Expected outcomes: OK, OK (via fallback), ERROR.
const allPassed = results[0] === true && results[1] === true && results[2] === false;

if (allPassed) {
  console.log("\nAll failover scenarios behaved as expected");
} else {
  console.log("\nFAIL: unexpected behavior");
  process.exit(1);
}
