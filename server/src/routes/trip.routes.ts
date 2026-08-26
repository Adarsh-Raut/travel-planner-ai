import { Router } from "express";
import {
  createTrip,
  listTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  generateTrip,
  regenerateTripDay,
  addActivity,
  removeActivity,
  shareTrip,
  unshareTrip,
} from "../controllers/trip.controller.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";

export const tripRouter = Router();

tripRouter.use(requireAuth);

tripRouter.post("/", createTrip);
tripRouter.get("/", listTrips);
tripRouter.get("/:id", getTrip);
tripRouter.patch("/:id", updateTrip);
tripRouter.delete("/:id", deleteTrip);
tripRouter.post("/:id/generate", generateTrip);
tripRouter.post("/:id/days/:day/regenerate", regenerateTripDay);
tripRouter.post("/:id/days/:day/activities", addActivity);
tripRouter.delete("/:id/days/:day/activities/:activityId", removeActivity);
tripRouter.post("/:id/share", shareTrip);
tripRouter.delete("/:id/share", unshareTrip);
