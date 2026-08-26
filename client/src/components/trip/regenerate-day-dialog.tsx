"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RegenerateDayDialogProps {
  dayNumber: number | null;
  pending: boolean;
  onSubmit: (dayNumber: number, instruction?: string) => Promise<boolean>;
  onClose: () => void;
}

export function RegenerateDayDialog({
  dayNumber,
  pending,
  onSubmit,
  onClose,
}: RegenerateDayDialogProps) {
  const [instruction, setInstruction] = useState("");

  if (dayNumber === null) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = instruction.trim();
    const ok = await onSubmit(dayNumber as number, trimmed || undefined);
    if (ok) onClose();
  }

  // Mounted only while a day is selected, so instruction state resets naturally.
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Regenerate day {dayNumber}</DialogTitle>
          <DialogDescription>
            The AI will replace this day&apos;s activities. Your other days and
            the budget stay untouched.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder='Any special requests? e.g. "more outdoor activities"'
            maxLength={300}
            aria-label="Regeneration instructions (optional)"
            disabled={pending}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Regenerating…
                </>
              ) : (
                <>
                  <Sparkles data-icon="inline-start" />
                  Regenerate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
