"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Trip } from "@/lib/types";

const POLL_INTERVAL_MS = 3000;

function fetchTrip(tripId: string): Promise<Trip> {
  return api<{ data: { trip: Trip } }>(`/api/trips/${tripId}`).then(
    ({ data }) => data.trip,
  );
}

export function useTrip(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchTrip(tripId).then(
      (loaded) => {
        if (!cancelled) {
          setTrip(loaded);
          setLoading(false);
        }
      },
      () => {
        if (!cancelled) {
          setError("Could not load this trip.");
          setLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  useEffect(() => {
    if (trip?.status !== "generating") return;

    const interval = setInterval(() => {
      void fetchTrip(tripId).then(
        (updated) => setTrip(updated),
        () => undefined,
      );
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [trip?.status, tripId]);

  const generate = useCallback(async (): Promise<boolean> => {
    setGenerating(true);
    setError(null);
    try {
      const { data } = await api<{ data: { trip: Trip } }>(
        `/api/trips/${tripId}/generate`,
        { method: "POST" },
      );
      setTrip(data.trip);
      return true;
    } catch (err) {
      void fetchTrip(tripId)
        .then((current) => setTrip(current))
        .catch(() => undefined);
      setError(
        err instanceof ApiError
          ? err.message
          : "Generation failed. Please try again.",
      );
      return false;
    } finally {
      setGenerating(false);
    }
  }, [tripId]);

  return { trip, loading, error, generating, generate };
}
