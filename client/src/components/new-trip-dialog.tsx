"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { BudgetType, Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const BUDGET_OPTIONS: { value: BudgetType; label: string; hint: string }[] = [
  { value: "low", label: "Low", hint: "Hostels & street food" },
  { value: "medium", label: "Medium", hint: "3★ hotels & mix" },
  { value: "high", label: "High", hint: "Luxury stays & dining" },
];

const INTEREST_PRESETS = [
  "Food",
  "Culture",
  "Adventure",
  "Shopping",
  "Nightlife",
  "Nature",
  "Museums",
  "Beaches",
];

const MAX_INTERESTS = 8;

interface NewTripDialogProps {
  onCreated: (trip: Trip) => void;
}

export function NewTripDialog({ onCreated }: NewTripDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("5");
  const [budgetType, setBudgetType] = useState<BudgetType>("medium");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggleInterest(interest: string) {
    setError(null);
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length >= MAX_INTERESTS
          ? prev
          : [...prev, interest],
    );
  }

  function resetForm() {
    setDestination("");
    setDays("5");
    setBudgetType("medium");
    setInterests([]);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!destination.trim()) {
      setError("Where are you going?");
      return;
    }
    const dayCount = Number(days);
    if (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > 30) {
      setError("Trips must be between 1 and 30 days");
      return;
    }
    if (interests.length === 0) {
      setError("Pick at least one interest");
      return;
    }

    setPending(true);
    try {
      const { data } = await api<{ data: { trip: Trip } }>("/api/trips", {
        method: "POST",
        body: {
          destination: destination.trim(),
          days: dayCount,
          budgetType,
          interests,
        },
      });
      onCreated(data.trip);
      setOpen(false);
      resetForm();
      router.push(`/trips/${data.trip.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create the trip. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : (setOpen(false), resetForm()))}>
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" />
          Plan new trip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Plan a new trip</DialogTitle>
          <DialogDescription>
            Tell us the basics — the AI builds the full itinerary next.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="Tokyo, Paris, Bali…"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Days (1–30)</Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Budget</Label>
            <div className="grid grid-cols-3 gap-2">
              {BUDGET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBudgetType(option.value)}
                  aria-pressed={budgetType === option.value}
                  className={cn(
                    "rounded-lg border p-2.5 text-left transition-colors",
                    budgetType === option.value
                      ? "border-primary bg-accent text-accent-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {option.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Interests{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({interests.length}/{MAX_INTERESTS})
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_PRESETS.map((preset) => {
                const selected = interests.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => toggleInterest(preset)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
