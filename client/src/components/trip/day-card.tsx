"use client";

import type { ItineraryDay } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DayCardProps {
  day: ItineraryDay;
  onRegenerate?: (dayNumber: number) => void;
  regeneratePending?: boolean;
}

export function DayCard({ day, onRegenerate, regeneratePending }: DayCardProps) {
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
      <CardContent>
        <ol className="relative ml-3 space-y-5 border-l">
          {day.activities.map((activity) => (
            <li key={activity.id} className="ml-6">
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
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
