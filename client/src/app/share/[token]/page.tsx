import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, TriangleAlert } from "lucide-react";
import type {
  BudgetType,
  HotelSuggestion,
  ItineraryDay,
  BudgetBreakdown,
} from "@/lib/types";
import { DayCard } from "@/components/trip/day-card";
import { BudgetCard } from "@/components/trip/budget-card";
import { HotelsSection } from "@/components/trip/hotels-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SharedTripView {
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
  title?: string;
  itinerary: ItineraryDay[];
  budget?: BudgetBreakdown;
  hotels: HotelSuggestion[];
  ownerName?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const BUDGET_LABEL = {
  low: "Budget",
  medium: "Mid-range",
  high: "Luxury",
} as const;

interface PageProps {
  params: Promise<{ token: string }>;
}

async function fetchSharedTrip(token: string): Promise<SharedTripView | null> {
  try {
    const response = await fetch(`${API_URL}/api/share/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data: { trip: SharedTripView } };
    return body.data.trip;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const trip = await fetchSharedTrip(token);
  return {
    title: trip ? `Trip to ${trip.destination} · AI Travel Planner` : "Shared trip",
  };
}

export default async function SharedTripPage({ params }: PageProps) {
  const { token } = await params;
  const trip = await fetchSharedTrip(token);

  if (!trip) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="space-y-3 py-8">
            <TriangleAlert className="mx-auto size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This shared trip doesn&apos;t exist or the link was revoked.
            </p>
            <Button variant="outline" asChild>
              <Link href="/">Go to AI Travel Planner</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Shared itinerary{trip.ownerName ? ` by ${trip.ownerName}` : ""}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {trip.title ?? trip.destination}
          </h1>
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
            <Badge
              key={interest}
              variant="ghost"
              className="bg-accent text-accent-foreground"
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section aria-label="Itinerary" className="space-y-4">
          {trip.itinerary.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label="Budget and hotels">
          {trip.budget ? <BudgetCard budget={trip.budget} /> : null}
          <HotelsSection hotels={trip.hotels} />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Planning a trip too?</CardTitle>
              <CardDescription>
                Generate your own AI itinerary in under a minute.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild>
                <Link href="/register">Try it free</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
