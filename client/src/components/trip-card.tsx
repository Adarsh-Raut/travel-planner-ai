"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BudgetType, Trip, TripStatus } from "@/lib/types";

const BUDGET_LABEL: Record<BudgetType, string> = {
  low: "Budget",
  medium: "Mid-range",
  high: "Luxury",
};

const STATUS_LABEL: Record<TripStatus, string> = {
  draft: "Draft",
  generating: "Generating…",
  ready: "Ready",
  failed: "Failed",
};

const MAX_SHOWN_INTERESTS = 3;

interface TripCardProps {
  trip: Trip;
  onDelete: (tripId: string) => void;
  deletePending?: boolean;
}

export function TripCard({ trip, onDelete, deletePending }: TripCardProps) {
  const hiddenInterests = Math.max(0, trip.interests.length - MAX_SHOWN_INTERESTS);

  return (
    <Card className="relative flex h-full flex-col transition-shadow hover:shadow-md">
      <Link
        href={`/trips/${trip.id}`}
        aria-label={`Open trip ${trip.title ?? trip.destination}`}
        className="absolute inset-0 rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      />
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-snug">
            {trip.title ?? trip.destination}
          </CardTitle>
          <Badge variant={trip.status === "ready" ? "default" : "secondary"}>
            {STATUS_LABEL[trip.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{trip.destination}</p>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {trip.days} {trip.days === 1 ? "day" : "days"}
          </Badge>
          <Badge variant="outline">{BUDGET_LABEL[trip.budgetType]}</Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {trip.interests.slice(0, MAX_SHOWN_INTERESTS).map((interest) => (
            <Badge key={interest} variant="ghost" className="bg-accent text-accent-foreground">
              {interest}
            </Badge>
          ))}
          {hiddenInterests > 0 ? (
            <Badge variant="ghost" className="bg-accent text-accent-foreground">
              +{hiddenInterests}
            </Badge>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="relative justify-between">
        <span className="text-xs text-muted-foreground">
          Created{" "}
          {new Date(trip.createdAt).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete trip to ${trip.destination}`}
              disabled={deletePending}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              {trip.title ?? trip.destination} and its itinerary will be
              permanently removed.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(trip.id)}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
