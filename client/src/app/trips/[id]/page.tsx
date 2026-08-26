"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { TripHeader } from "@/components/trip/trip-header";
import { DayCard } from "@/components/trip/day-card";
import { BudgetCard } from "@/components/trip/budget-card";
import { HotelsSection } from "@/components/trip/hotels-section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const { trip, loading, error, generating, generate } = useTrip(params.id);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="space-y-3 py-8">
            <TriangleAlert className="mx-auto size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {error ?? "Trip not found."}
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to trips</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (trip.status !== "ready") {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 p-6">
        <TripHeader trip={trip} />
        <StatusPanel
          status={trip.status}
          destination={trip.destination}
          generating={generating}
          error={error}
          onGenerate={() => void generate()}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <TripHeader trip={trip} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section aria-label="Itinerary" className="space-y-4">
          {trip.itinerary.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label="Budget and hotels">
          {trip.budget ? <BudgetCard budget={trip.budget} /> : null}
          <HotelsSection hotels={trip.hotels} />
        </aside>
      </div>
    </main>
  );
}

function StatusPanel({
  status,
  destination,
  generating,
  error,
  onGenerate,
}: {
  status: "draft" | "generating" | "failed";
  destination: string;
  generating: boolean;
  error: string | null;
  onGenerate: () => void;
}) {
  if (status === "generating") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="font-medium">Our AI agents are crafting your itinerary…</p>
          <p className="text-sm text-muted-foreground">
            This usually takes under a minute. The page updates automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "failed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="size-5" />
            Generation didn&apos;t finish
          </CardTitle>
          <CardDescription>
            {error ??
              "Something went wrong while planning this trip. Your trip details are safe — just try again."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onGenerate} disabled={generating}>
            <Sparkles data-icon="inline-start" />
            {generating ? "Generating…" : "Try again"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center pb-4 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Sparkles />
        </div>
        <CardTitle>Ready to plan {destination}?</CardTitle>
        <CardDescription>
          The AI builds a day-by-day itinerary with budget estimates and hotel
          suggestions. It takes under a minute.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button size="lg" onClick={onGenerate} disabled={generating}>
          {generating ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles data-icon="inline-start" />
              Generate itinerary
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

