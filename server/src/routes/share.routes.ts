import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getSharedTrip } from "../controllers/trip.controller.js";

export const shareRouter = Router();

const viewLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

shareRouter.get("/:token", viewLimiter, getSharedTrip);
