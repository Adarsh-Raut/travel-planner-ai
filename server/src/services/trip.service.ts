import {
  Trip,
  toPublicTrip,
  type PublicTrip,
  type TripDocument,
} from "../models/trip.model.js";
import type { CreateTripDto } from "../validators/trip.validators.js";

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
