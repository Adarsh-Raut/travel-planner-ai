export interface PublicUser {
  id: string;
  name?: string;
  email: string;
  createdAt: string;
}

export type BudgetType = "low" | "medium" | "high";
export type TripStatus = "draft" | "generating" | "ready" | "failed";
export type HotelTier = "budget" | "mid_range" | "luxury";

export interface Activity {
  id: string;
  title: string;
  description?: string;
  category?: string;
}

export interface ItineraryDay {
  day: number;
  activities: Activity[];
}

export interface BudgetBreakdown {
  currency: string;
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface HotelSuggestion {
  name: string;
  tier: HotelTier;
  note?: string;
}

export interface Trip {
  id: string;
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
  title?: string;
  status: TripStatus;
  itinerary: ItineraryDay[];
  budget?: BudgetBreakdown;
  hotels: HotelSuggestion[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
}
