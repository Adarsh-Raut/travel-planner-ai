import type { Request, Response } from "express";
import {
  createTripSchema,
  regenerateDaySchema,
  updateTripSchema,
} from "../validators/trip.validators.js";
import * as tripService from "../services/trip.service.js";
import { parseBody } from "../utils/validation.js";
import { HttpError } from "../utils/http-error.js";

function requireUserId(req: Request): string {
  if (!req.userId) {
    throw new HttpError(401, "UNAUTHORIZED", "Authentication required");
  }
  return req.userId;
}

function requirePathParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new HttpError(400, "BAD_REQUEST", `Missing path parameter: ${name}`);
  }
  return value;
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

export async function getTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const trip = await tripService.getTrip(userId, requirePathParam(req, "id"));
  res.json({ data: { trip } });
}

export async function updateTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const dto = parseBody(updateTripSchema, req.body);
  const trip = await tripService.updateTrip(userId, requirePathParam(req, "id"), dto);
  res.json({ data: { trip } });
}

export async function deleteTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  await tripService.deleteTrip(userId, requirePathParam(req, "id"));
  res.json({ data: { success: true } });
}

export async function generateTrip(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const trip = await tripService.generateTripContent(
    userId,
    requirePathParam(req, "id"),
  );
  res.json({ data: { trip } });
}

export async function regenerateTripDay(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const dto = parseBody(regenerateDaySchema, req.body ?? {});
  const trip = await tripService.regenerateTripDay(
    userId,
    requirePathParam(req, "id"),
    requirePathParam(req, "day"),
    dto,
  );
  res.json({ data: { trip } });
}
