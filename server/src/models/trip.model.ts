import mongoose, { Schema } from "mongoose";

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

export interface TripDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
  title?: string;
  status: TripStatus;
  itinerary: ItineraryDay[];
  budget?: BudgetBreakdown;
  hotels: HotelSuggestion[];
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<Activity>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 500 },
    category: { type: String, trim: true, maxlength: 40 },
  },
  { _id: false },
);

const itineraryDaySchema = new Schema<ItineraryDay>(
  {
    day: { type: Number, required: true, min: 1 },
    activities: { type: [activitySchema], default: [] },
  },
  { _id: false },
);

const budgetSchema = new Schema<BudgetBreakdown>(
  {
    currency: { type: String, required: true, default: "USD" },
    flights: { type: Number, required: true, min: 0 },
    accommodation: { type: Number, required: true, min: 0 },
    food: { type: Number, required: true, min: 0 },
    activities: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const hotelSchema = new Schema<HotelSuggestion>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    tier: { type: String, required: true, enum: ["budget", "mid_range", "luxury"] satisfies HotelTier[] },
    note: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false },
);

const tripSchema = new Schema<TripDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    destination: { type: String, required: true, trim: true, maxlength: 100 },
    days: { type: Number, required: true, min: 1, max: 30 },
    budgetType: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"] satisfies BudgetType[],
    },
    interests: {
      type: [String],
      required: true,
      validate: [(v: string[]) => v.length >= 1 && v.length <= 8, "1-8 interests"],
    },
    title: { type: String, trim: true, maxlength: 120 },
    status: {
      type: String,
      enum: ["draft", "generating", "ready", "failed"] satisfies TripStatus[],
      default: "draft",
      index: true,
    },
    itinerary: { type: [itineraryDaySchema], default: [] },
    budget: { type: budgetSchema, default: undefined },
    hotels: { type: [hotelSchema], default: [] },
    shareToken: { type: String, index: true, unique: true, sparse: true },
  },
  { timestamps: true },
);

export interface PublicTrip {
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
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicTrip(trip: TripDocument): PublicTrip {
  return {
    id: trip._id.toString(),
    destination: trip.destination,
    days: trip.days,
    budgetType: trip.budgetType,
    interests: trip.interests,
    ...(trip.title ? { title: trip.title } : {}),
    status: trip.status,
    itinerary: trip.itinerary,
    ...(trip.budget ? { budget: trip.budget } : {}),
    hotels: trip.hotels,
    isShared: Boolean(trip.shareToken),
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
}

export const Trip = mongoose.model<TripDocument>("Trip", tripSchema);
