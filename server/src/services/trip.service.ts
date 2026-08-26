import mongoose from "mongoose";
import {
  Trip,
  toPublicTrip,
  type PublicTrip,
  type TripDocument,
} from "../models/trip.model.js";
import type { CreateTripDto, UpdateTripDto } from "../validators/trip.validators.js";
import { HttpError } from "../utils/http-error.js";

const TRIP_NOT_FOUND = new HttpError(404, "TRIP_NOT_FOUND", "Trip not found");

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
