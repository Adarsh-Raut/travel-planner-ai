"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTrips } from "@/hooks/use-trips";
import { NewTripDialog } from "@/components/new-trip-dialog";
import { TripCard } from "@/components/trip-card";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { status } = useAuth();
  const router = useRouter();
  const { trips, loading, error, refresh, addTrip, removeTrip } = useTrips();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  async function handleDelete(tripId: string) {
    setDeletingId(tripId);
    try {
      await api(`/api/trips/${tripId}`, { method: "DELETE" });
      removeTrip(tripId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your trips</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${trips.length} ${trips.length === 1 ? "trip" : "trips"}`}
          </p>
        </div>
        <NewTripDialog onCreated={addTrip} />
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <MapPin />
            </div>
            <CardTitle>Where to first?</CardTitle>
            <CardDescription>
              You have no trips yet. Plan one and the AI will build your
              day-by-day itinerary.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <NewTripDialog onCreated={addTrip} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDelete={(id) => void handleDelete(id)}
              deletePending={deletingId === trip.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}
