"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import type { Trip, TripStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<TripStatus, string> = {
  draft: "Draft",
  generating: "Generating…",
  ready: "Ready",
  failed: "Failed",
};

const STATUS_VARIANT: Record<TripStatus, "default" | "secondary" | "destructive"> = {
  draft: "secondary",
  generating: "secondary",
  ready: "default",
  failed: "destructive",
};

const BUDGET_LABEL = {
  low: "Budget",
  medium: "Mid-range",
  high: "Luxury",
} as const;

interface TripHeaderProps {
  trip: Trip;
  onShare?: () => void;
}

export function TripHeader({ trip, onShare }: TripHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Your trips
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {trip.title ?? trip.destination}
          </h1>
          <Badge variant={STATUS_VARIANT[trip.status]}>{STATUS_LABEL[trip.status]}</Badge>
        </div>
        {onShare && trip.status === "ready" ? (
          <Button variant="outline" size="sm" onClick={onShare}>
            Share
          </Button>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" />
          {trip.destination}
        </span>
        <span>·</span>
        <span>
          {trip.days} {trip.days === 1 ? "day" : "days"}
        </span>
        <span>·</span>
        <span>{BUDGET_LABEL[trip.budgetType]}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {trip.interests.map((interest) => (
          <Badge key={interest} variant="ghost" className="bg-accent text-accent-foreground">
            {interest}
          </Badge>
        ))}
      </div>
    </div>
  );
}
