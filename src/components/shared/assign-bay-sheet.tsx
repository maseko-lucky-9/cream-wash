"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bay, Job } from "@/lib/database.types";

interface AssignBaySheetProps {
  job: Job | null;
  bays: Bay[];
  onAssign: (jobId: string, bayId: string) => Promise<void>;
  onClose: () => void;
}

export function AssignBaySheet({ job, bays, onAssign, onClose }: AssignBaySheetProps) {
  const [loading, setLoading] = useState(false);
  const [selectedBay, setSelectedBay] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const availableBays = bays.filter((b) => b.status === "idle");

  const handleAssign = async () => {
    if (!selectedBay) return;
    setLoading(true);
    try {
      await onAssign(job.id, selectedBay);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-bay-heading"
        className="relative w-full max-w-lg rounded-t-2xl shadow-card-lg p-6 pb-8 animate-in slide-in-from-bottom duration-300 ease-out glass-card border-b-0 border-t border-x bg-[rgba(255,252,247,0.85)]"
      >
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2
            id="assign-bay-heading"
            className="text-lg font-display font-semibold text-foreground"
          >
            Assign to Bay
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Assigning <span className="font-medium text-foreground">{job.customer_name}</span>
        </p>

        {availableBays.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
              <Car className="w-6 h-6 text-muted-foreground/40" aria-hidden="true" />
            </div>
            <p className="text-muted-foreground font-medium">All bays occupied</p>
            <p className="text-sm text-muted-foreground">
              Wait for a bay to become available.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {availableBays.map((bay) => (
                <button
                  key={bay.id}
                  onClick={() => setSelectedBay(bay.id)}
                  className={cn(
                    "w-full h-[56px] rounded-lg border flex items-center justify-center font-medium text-base transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1",
                    selectedBay === bay.id
                      ? "border-accent/30 glass-card shadow-glow-accent text-accent"
                      : "border-white/40 glass-surface text-foreground hover:border-white/60"
                  )}
                >
                  {bay.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleAssign}
              disabled={!selectedBay || loading}
              className="w-full h-[56px] rounded-lg glossy-btn text-accent-foreground font-medium flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  Assigning...
                </>
              ) : (
                "Assign to Bay"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
