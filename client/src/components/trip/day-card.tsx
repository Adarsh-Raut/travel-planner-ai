"use client";

import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import type { ItineraryDay } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DayCardProps {
  day: ItineraryDay;
  onRegenerate?: (dayNumber: number) => void;
  regeneratePending?: boolean;
  onAddActivity?: (dayNumber: number, title: string) => Promise<boolean>;
  onRemoveActivity?: (dayNumber: number, activityId: string) => Promise<boolean>;
  addPending?: boolean;
  removingId?: string | null;
}

export function DayCard({
  day,
  onRegenerate,
  regeneratePending,
  onAddActivity,
  onRemoveActivity,
  addPending,
  removingId,
}: DayCardProps) {
  const editable = Boolean(onAddActivity && onRemoveActivity);
  const [newTitle, setNewTitle] = useState("");

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title || !onAddActivity) return;
    const ok = await onAddActivity(day.day, title);
    if (ok) setNewTitle("");
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Day {day.day}</CardTitle>
        {onRegenerate ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRegenerate(day.day)}
            disabled={regeneratePending}
          >
            {regeneratePending ? "Regenerating…" : "Regenerate day"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="relative ml-3 space-y-5 border-l">
          {day.activities.map((activity) => (
            <li key={activity.id} className="ml-6 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="absolute -left-[6px] mt-1.5 size-3 rounded-full border-2 border-background bg-primary" />
                <p className="font-medium leading-snug">{activity.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {activity.description}
                </p>
                {activity.category ? (
                  <Badge
                    variant="ghost"
                    className="mt-1.5 bg-accent text-accent-foreground"
                  >
                    {activity.category}
                  </Badge>
                ) : null}
              </div>
              {editable ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${activity.title}`}
                  disabled={removingId === activity.id}
                  onClick={() => void onRemoveActivity?.(day.day, activity.id)}
                >
                  <X />
                </Button>
              ) : null}
            </li>
          ))}
        </ol>

        {editable ? (
          <form onSubmit={(e) => void handleAdd(e)} className="flex gap-2 pl-3">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={`Add an activity to day ${day.day}…`}
              maxLength={160}
              aria-label={`New activity for day ${day.day}`}
              disabled={addPending}
            />
            <Button type="submit" size="icon" aria-label="Add activity" disabled={addPending || !newTitle.trim()}>
              <Plus />
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
