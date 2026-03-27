"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
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
      <div className="relative w-full max-w-lg rounded-t-2xl shadow-card-lg p-6 pb-8 animate-in slide-in-from-bottom duration-300 ease-out glass-card border-b-0 border-t border-x bg-[rgba(255,252,247,0.85)]">
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            Assign to Bay
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Assigning <span className="font-medium text-foreground">{job.customer_name}</span>
        </p>

        {availableBays.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-medium">
              All bays occupied
            </p>
            <p className="text-sm text-muted-foreground mt-1">
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
                    "w-full h-[56px] rounded-lg border flex items-center justify-center font-medium text-base transition-all duration-150 hover:-translate-y-px",
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
              className="w-full h-[56px] rounded-lg glossy-btn text-accent-foreground font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
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
