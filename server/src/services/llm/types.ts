import type {
  BudgetBreakdown,
  BudgetType,
  HotelSuggestion,
  ItineraryDay,
} from "../../models/trip.model.js";

export interface TripGenerationInput {
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
}

export interface GeneratedTrip {
  itinerary: ItineraryDay[];
  budget: BudgetBreakdown;
  hotels: HotelSuggestion[];
}

export interface LlmProvider {
  readonly name: string;
  generateTrip(input: TripGenerationInput): Promise<GeneratedTrip>;
}
