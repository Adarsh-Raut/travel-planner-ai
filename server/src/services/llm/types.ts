import type {
  Activity,
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

export interface DayGenerationInput {
  destination: string;
  budgetType: BudgetType;
  interests: string[];
  dayNumber: number;
  totalDays: number;
  existingActivities: {
    title: string;
    description?: string;
    category?: string;
  }[];
  instruction?: string;
}

export interface GeneratedTrip {
  itinerary: ItineraryDay[];
  budget: BudgetBreakdown;
  hotels: HotelSuggestion[];
}

export interface GeneratedDay {
  activities: Activity[];
}

export interface GenerationResult {
  trip: GeneratedTrip;
  servedBy: string;
}

export interface LlmProvider {
  readonly name: string;
  generateTrip(input: TripGenerationInput): Promise<GeneratedTrip>;
  generateDay(input: DayGenerationInput): Promise<GeneratedDay>;
}
