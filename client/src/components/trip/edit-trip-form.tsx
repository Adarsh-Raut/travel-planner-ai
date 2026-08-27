"use client";

import { useState } from "react";
import { Calendar, DollarSign, MapPin, Pencil, Tag, X } from "lucide-react";
import type { BudgetType, Trip } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const BUDGET_OPTIONS: { value: BudgetType; label: string }[] = [
  { value: "low", label: "Budget" },
  { value: "medium", label: "Mid-range" },
  { value: "high", label: "Luxury" },
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

interface EditTripFormProps {
  trip: Trip;
  onSave: (fields: {
    destination?: string;
    days?: number;
    budgetType?: BudgetType;
    interests?: string[];
  }) => Promise<boolean>;
  saving: boolean;
  error: string | null;
}

type Field = "destination" | "days" | "budgetType" | "interests";

export function EditTripForm({ trip, onSave, saving, error }: EditTripFormProps) {
  const [editing, setEditing] = useState<Field | null>(null);

  const [destination, setDestination] = useState(trip.destination);
  const [days, setDays] = useState(String(trip.days));
  const [budgetType, setBudgetType] = useState<BudgetType>(trip.budgetType);
  const [interests, setInterests] = useState<string[]>([...trip.interests]);

  const hasChanges =
    destination.trim() !== trip.destination ||
    Number(days) !== trip.days ||
    budgetType !== trip.budgetType ||
    interests.length !== trip.interests.length ||
    interests.some((i, idx) => i !== trip.interests[idx]);

  function startEdit(field: Field) {
    setEditing(field);
  }

  function cancelEdit() {
    setEditing(null);
    setDestination(trip.destination);
    setDays(String(trip.days));
    setBudgetType(trip.budgetType);
    setInterests([...trip.interests]);
  }

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length >= MAX_INTERESTS
          ? prev
          : [...prev, interest],
    );
  }

  async function handleSave() {
    const dayCount = Number(days);
    if (!destination.trim() || !Number.isInteger(dayCount) || dayCount < 1 || dayCount > 30 || interests.length === 0) {
      return;
    }

    const fields: Record<string, unknown> = {};
    if (destination.trim() !== trip.destination) fields.destination = destination.trim();
    if (dayCount !== trip.days) fields.days = dayCount;
    if (budgetType !== trip.budgetType) fields.budgetType = budgetType;
    if (
      interests.length !== trip.interests.length ||
      interests.some((i, idx) => i !== trip.interests[idx])
    ) {
      fields.interests = interests;
    }

    if (Object.keys(fields).length === 0) return;

    const ok = await onSave(fields as { destination?: string; days?: number; budgetType?: BudgetType; interests?: string[] });
    if (ok) setEditing(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Trip details</h3>
        {editing !== null ? (
          <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 gap-1 text-xs">
            <X className="size-3" />
            Cancel
          </Button>
        ) : null}
      </div>

      {/* Destination */}
      <div className="flex items-center gap-3 rounded-lg border p-3">
        <MapPin className="size-4 shrink-0 text-muted-foreground" />
        {editing === "destination" ? (
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="edit-destination" className="sr-only">Destination</Label>
            <Input
              id="edit-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm">{trip.destination}</span>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => startEdit("destination")}>
              <Pencil className="size-3" />
            </Button>
          </>
        )}
      </div>

      {/* Days */}
      <div className="flex items-center gap-3 rounded-lg border p-3">
        <Calendar className="size-4 shrink-0 text-muted-foreground" />
        {editing === "days" ? (
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="edit-days" className="sr-only">Days</Label>
            <Input
              id="edit-days"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm">
              {trip.days} {trip.days === 1 ? "day" : "days"}
            </span>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => startEdit("days")}>
              <Pencil className="size-3" />
            </Button>
          </>
        )}
      </div>

      {/* Budget */}
      <div className="flex items-center gap-3 rounded-lg border p-3">
        <DollarSign className="size-4 shrink-0 text-muted-foreground" />
        {editing === "budgetType" ? (
          <div className="flex flex-1 gap-1.5">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBudgetType(option.value)}
                aria-pressed={budgetType === option.value}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  budgetType === option.value
                    ? "border-primary bg-accent text-accent-foreground"
                    : "hover:bg-muted",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm">
              {BUDGET_OPTIONS.find((o) => o.value === trip.budgetType)?.label}
            </span>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => startEdit("budgetType")}>
              <Pencil className="size-3" />
            </Button>
          </>
        )}
      </div>

      {/* Interests */}
      <div className="rounded-lg border p-3">
        <div className="flex items-center gap-3">
          <Tag className="size-4 shrink-0 text-muted-foreground" />
          {editing !== "interests" ? (
            <>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {trip.interests.map((interest) => (
                  <Badge key={interest} variant="ghost" className="bg-accent text-accent-foreground">
                    {interest}
                  </Badge>
                ))}
              </div>
              <Button variant="ghost" size="icon" className="size-7" onClick={() => startEdit("interests")}>
                <Pencil className="size-3" />
              </Button>
            </>
          ) : (
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_PRESETS.map((preset) => {
                  const selected = interests.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => toggleInterest(preset)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
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
              <p className="text-xs text-muted-foreground">
                {interests.length}/{MAX_INTERESTS} selected
              </p>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      ) : null}

      {hasChanges ? (
        <Button onClick={() => void handleSave()} disabled={saving} size="sm" className="w-full">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      ) : null}
    </div>
  );
}
