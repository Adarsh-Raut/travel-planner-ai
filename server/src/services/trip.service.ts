import mongoose from "mongoose";
import {
  Trip,
  toPublicTrip,
  type PublicTrip,
  type TripDocument,
} from "../models/trip.model.js";
import type {
  CreateTripDto,
  RegenerateDayDto,
  UpdateTripDto,
} from "../validators/trip.validators.js";
import { HttpError } from "../utils/http-error.js";
import { logger } from "../config/logger.js";
import { llmService } from "./llm/orchestrator.js";

const TRIP_NOT_FOUND = new HttpError(404, "TRIP_NOT_FOUND", "Trip not found");

const GENERATABLE_STATUSES = ["draft", "failed"] as const;

const INPUT_FIELD_NAMES = ["destination", "days", "budgetType", "interests"] as const;

function assertValidTripId(id: string): void {
  // Foreign or missing trips both surface as 404 so callers cannot probe ids.
  if (!mongoose.isValidObjectId(id)) throw TRIP_NOT_FOUND;
}

export async function createTrip(
  userId: string,
  dto: CreateTripDto,
): Promise<PublicTrip> {
  const trip: TripDocument = await Trip.create({
    user: userId,
    destination: dto.destination,
    days: dto.days,
    budgetType: dto.budgetType,
    interests: dto.interests,
    ...(dto.title ? { title: dto.title } : {}),
  });
  return toPublicTrip(trip);
}

export async function listTrips(userId: string): Promise<PublicTrip[]> {
  const trips = await Trip.find({ user: userId }).sort({ createdAt: -1 });
  return trips.map(toPublicTrip);
}

export async function getTrip(userId: string, tripId: string): Promise<PublicTrip> {
  assertValidTripId(tripId);
  const trip = await Trip.findOne({ _id: tripId, user: userId });
  if (!trip) throw TRIP_NOT_FOUND;
  return toPublicTrip(trip);
}

export async function updateTrip(
  userId: string,
  tripId: string,
  dto: UpdateTripDto,
): Promise<PublicTrip> {
  assertValidTripId(tripId);

  const touchesInputs = INPUT_FIELD_NAMES.some((field) => dto[field] !== undefined);
  if (touchesInputs) {
    const trip = await Trip.findOne({ _id: tripId, user: userId }, { status: 1 });
    if (!trip) throw TRIP_NOT_FOUND;
    if (trip.status === "ready") {
      throw new HttpError(
        409,
        "TRIP_INPUTS_LOCKED",
        "Itinerary inputs are locked after generation — regenerate the day or plan a new trip instead",
      );
    }
  }

  const trip = await Trip.findOneAndUpdate(
    { _id: tripId, user: userId },
    { $set: dto },
    { new: true },
  );
  if (!trip) throw TRIP_NOT_FOUND;
  return toPublicTrip(trip);
}

export async function deleteTrip(userId: string, tripId: string): Promise<void> {
  assertValidTripId(tripId);
  const { deletedCount } = await Trip.deleteOne({ _id: tripId, user: userId });
  if (deletedCount === 0) throw TRIP_NOT_FOUND;
}

export async function generateTripContent(
  userId: string,
  tripId: string,
): Promise<PublicTrip> {
  assertValidTripId(tripId);

  const claimed = await Trip.findOneAndUpdate(
    { _id: tripId, user: userId, status: { $in: [...GENERATABLE_STATUSES] } },
    { $set: { status: "generating" } },
    { new: true },
  );

  if (!claimed) {
    const existing = await Trip.findOne({ _id: tripId, user: userId }, { status: 1 });
    if (!existing) throw TRIP_NOT_FOUND;
    throw new HttpError(
      409,
      "TRIP_NOT_GENERATABLE",
      `Trip is already ${existing.status}`,
    );
  }

  try {
    const result = await llmService.generateTrip({
      destination: claimed.destination,
      days: claimed.days,
      budgetType: claimed.budgetType,
      interests: claimed.interests,
    });

    claimed.itinerary = result.trip.itinerary;
    claimed.budget = result.trip.budget;
    claimed.hotels = result.trip.hotels;
    claimed.status = "ready";
    await claimed.save();

    logger.info(
      { tripId, servedBy: result.servedBy, days: result.trip.itinerary.length },
      "Trip content generated",
    );
    return toPublicTrip(claimed);
  } catch (err) {
    claimed.status = "failed";
    try {
      await claimed.save();
    } catch (saveErr) {
      logger.error({ err: saveErr, tripId }, "Could not persist failed status");
    }
    throw err;
  }
}

export async function regenerateTripDay(
  userId: string,
  tripId: string,
  dayParam: string,
  dto: RegenerateDayDto,
): Promise<PublicTrip> {
  assertValidTripId(tripId);

  const dayNumber = Number(dayParam);
  if (!Number.isInteger(dayNumber) || dayNumber < 1) {
    throw new HttpError(400, "BAD_REQUEST", "Day must be a positive whole number");
  }

  const trip = await Trip.findOne({ _id: tripId, user: userId });
  if (!trip) throw TRIP_NOT_FOUND;
  if (trip.status !== "ready") {
    throw new HttpError(
      409,
      "TRIP_NOT_READY",
      "Generate the itinerary before editing individual days",
    );
  }

  const dayEntry = trip.itinerary.find((day) => day.day === dayNumber);
  if (!dayEntry) {
    throw new HttpError(404, "DAY_NOT_FOUND", `Trip has no day ${dayNumber}`);
  }

  const { result, servedBy } = await llmService.generateDay({
    destination: trip.destination,
    budgetType: trip.budgetType,
    interests: trip.interests,
    dayNumber,
    totalDays: trip.days,
    existingActivities: dayEntry.activities.map((activity) => ({
      title: activity.title,
      ...(activity.description ? { description: activity.description } : {}),
      ...(activity.category ? { category: activity.category } : {}),
    })),
    ...(dto.instruction ? { instruction: dto.instruction } : {}),
  });

  dayEntry.activities = result.activities;
  await trip.save();

  logger.info(
    { tripId, servedBy, day: dayNumber },
    "Day regenerated",
  );
  return toPublicTrip(trip);
}
