"use client";

import { useState } from "react";
import { Check, Copy, Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareDialogProps {
  url: string | null;
  creating: boolean;
  revoking: boolean;
  onCreate: () => void;
  onRevoke: () => void;
  onClose: () => void;
}

export function ShareDialog({
  url,
  creating,
  revoking,
  onCreate,
  onRevoke,
  onClose,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  function handleOpenChange(open: boolean) {
    if (!open) onClose();
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context); the input stays selectable.
    }
  }

  return (
    <Dialog open={url !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this trip</DialogTitle>
          <DialogDescription>
            Anyone with the link can view the itinerary — read-only. No account
            needed.
          </DialogDescription>
        </DialogHeader>

        {url ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input readOnly value={url} onFocus={(e) => e.target.select()} />
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Copy link"
                onClick={() => void copy()}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {copied ? "Link copied!" : "Anyone with this link can view the trip."}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                disabled={revoking}
                onClick={onRevoke}
              >
                <Trash2 data-icon="inline-start" />
                {revoking ? "Revoking…" : "Revoke access"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button type="button" onClick={onCreate} disabled={creating}>
              <Link2 data-icon="inline-start" />
              {creating ? "Creating link…" : "Create share link"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
