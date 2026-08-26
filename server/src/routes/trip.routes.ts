import { Router } from "express";
import { createTrip, listTrips } from "../controllers/trip.controller.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";

export const tripRouter = Router();

tripRouter.use(requireAuth);

tripRouter.post("/", createTrip);
tripRouter.get("/", listTrips);
