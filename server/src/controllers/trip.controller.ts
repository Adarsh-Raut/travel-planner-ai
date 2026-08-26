import type { Request, Response } from "express";
import { createTripSchema } from "../validators/trip.validators.js";
import * as tripService from "../services/trip.service.js";
import { parseBody } from "../utils/validation.js";
import { HttpError } from "../utils/http-error.js";

function requireUserId(req: Request): string {
  if (!req.userId) {
    throw new HttpError(401, "UNAUTHORIZED", "Authentication required");
  }
  return req.userId;
}

export async function createTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const dto = parseBody(createTripSchema, req.body);
  const trip = await tripService.createTrip(userId, dto);
  res.status(201).json({ data: { trip } });
}

export async function listTrips(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const trips = await tripService.listTrips(userId);
  res.json({ data: { trips } });
}
