"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Trip } from "@/lib/types";

interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
}

const LOAD_ERROR = "Could not load your trips. Please try again.";

function fetchTrips(): Promise<Trip[]> {
  return api<{ data: { trips: Trip[] } }>("/api/trips").then(
    ({ data }) => data.trips,
  );
}

export function useTrips() {
  const [state, setState] = useState<TripsState>({
    trips: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetchTrips().then(
      (trips) => {
        if (!cancelled) setState({ trips, loading: false, error: null });
      },
      () => {
        if (!cancelled) setState({ trips: [], loading: false, error: LOAD_ERROR });
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const trips = await fetchTrips();
      setState({ trips, loading: false, error: null });
    } catch {
      setState({ trips: [], loading: false, error: LOAD_ERROR });
    }
  }, []);

  const addTrip = useCallback((trip: Trip) => {
    setState((prev) => ({ ...prev, trips: [trip, ...prev.trips] }));
  }, []);

  const removeTrip = useCallback((tripId: string) => {
    setState((prev) => ({
      ...prev,
      trips: prev.trips.filter((t) => t.id !== tripId),
    }));
  }, []);

  return { ...state, refresh, addTrip, removeTrip };
}
