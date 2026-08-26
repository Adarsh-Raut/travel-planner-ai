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

  const [mutationError, setMutationError] = useState<string | null>(null);

  const addActivity = useCallback(
    async (dayNumber: number, title: string): Promise<boolean> => {
      setMutationError(null);
      try {
        const { data } = await api<{ data: { trip: Trip } }>(
          `/api/trips/${tripId}/days/${dayNumber}/activities`,
          { method: "POST", body: { title } },
        );
        setTrip(data.trip);
        return true;
      } catch (err) {
        setMutationError(
          err instanceof ApiError ? err.message : "Could not add the activity.",
        );
        return false;
      }
    },
    [tripId],
  );

  const removeActivity = useCallback(
    async (dayNumber: number, activityId: string): Promise<boolean> => {
      setMutationError(null);
      try {
        const { data } = await api<{ data: { trip: Trip } }>(
          `/api/trips/${tripId}/days/${dayNumber}/activities/${activityId}`,
          { method: "DELETE" },
        );
        setTrip(data.trip);
        return true;
      } catch (err) {
        setMutationError(
          err instanceof ApiError
            ? err.message
            : "Could not remove the activity.",
        );
        return false;
      }
    },
    [tripId],
  );

  const regenerateDay = useCallback(
    async (dayNumber: number, instruction?: string): Promise<boolean> => {
      setMutationError(null);
      try {
        const { data } = await api<{ data: { trip: Trip } }>(
          `/api/trips/${tripId}/days/${dayNumber}/regenerate`,
          { method: "POST", body: instruction ? { instruction } : {} },
        );
        setTrip(data.trip);
        return true;
      } catch (err) {
        setMutationError(
          err instanceof ApiError
            ? err.message
            : "Could not regenerate this day.",
        );
        return false;
      }
    },
    [tripId],
  );

  const shareTrip = useCallback(async (): Promise<string | null> => {
    setMutationError(null);
    try {
      const { data } = await api<{ data: { token: string } }>(
        `/api/trips/${tripId}/share`,
        { method: "POST" },
      );
      void fetchTrip(tripId)
        .then((current) => setTrip(current))
        .catch(() => undefined);
      return data.token;
    } catch (err) {
      setMutationError(
        err instanceof ApiError ? err.message : "Could not create a share link.",
      );
      return null;
    }
  }, [tripId]);

  const revokeShare = useCallback(async (): Promise<boolean> => {
    setMutationError(null);
    try {
      await api(`/api/trips/${tripId}/share`, { method: "DELETE" });
      void fetchTrip(tripId)
        .then((current) => setTrip(current))
        .catch(() => undefined);
      return true;
    } catch (err) {
      setMutationError(
        err instanceof ApiError ? err.message : "Could not revoke the link.",
      );
      return false;
    }
  }, [tripId]);

  return {
    trip,
    loading,
    error,
    generating,
    generate,
    mutationError,
    addActivity,
    removeActivity,
    regenerateDay,
    shareTrip,
    revokeShare,
  };
}
