"use client";

import type { BudgetBreakdown } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

interface BudgetCardProps {
  budget: BudgetBreakdown;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const symbol = CURRENCY_SYMBOL[budget.currency] ?? "";

  function money(amount: number): string {
    return `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  const rows: [string, number][] = [
    ["Flights", budget.flights],
    ["Accommodation", budget.accommodation],
    ["Food", budget.food],
    ["Activities", budget.activities],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estimated budget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.map(([label, amount]) => (
          <div key={label} className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span>{money(amount)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2.5 font-semibold">
          <span>Total</span>
          <span>{money(budget.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
