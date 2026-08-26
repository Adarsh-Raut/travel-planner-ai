"use client";

import type { HotelSuggestion, HotelTier } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TIER_LABEL: Record<HotelTier, string> = {
  budget: "Budget pick",
  mid_range: "Mid-range pick",
  luxury: "Luxury pick",
};

interface HotelsSectionProps {
  hotels: HotelSuggestion[];
}

export function HotelsSection({ hotels }: HotelsSectionProps) {
  if (hotels.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Where to stay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hotels.map((hotel) => (
          <div key={hotel.name}>
            <Badge variant="outline" className="mb-1">
              {TIER_LABEL[hotel.tier]}
            </Badge>
            <p className="font-medium leading-snug">{hotel.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{hotel.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
