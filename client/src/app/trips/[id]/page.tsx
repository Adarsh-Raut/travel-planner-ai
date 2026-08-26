"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Itinerary coming soon</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Trip <span className="font-mono">{params.id}</span> exists — the
        day-by-day itinerary view and AI generation land in the next phase.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard">Back to trips</Link>
      </Button>
    </main>
  );
}
