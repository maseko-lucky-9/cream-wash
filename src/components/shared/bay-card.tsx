"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Car, Clock } from "lucide-react";
import { cn, getElapsedTime } from "@/lib/utils";
import type { Bay, Job, WashTier } from "@/lib/database.types";

interface BayCardProps {
  bay: Bay;
  currentJob?: (Job & { wash_tier?: WashTier }) | null;
  onComplete?: (jobId: string) => void;
  compact?: boolean;
}

export function BayCard({ bay, currentJob, onComplete, compact = false }: BayCardProps) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (bay.status !== "in_progress" || !currentJob?.started_at) return;

    const update = () => setElapsed(getElapsedTime(currentJob.started_at!));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [bay.status, currentJob?.started_at]);

  const isActive = bay.status === "in_progress";

  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium select-none",
          isActive
            ? "bg-status-active/10 text-status-active"
            : "bg-status-idle/10 text-status-idle"
        )}
        aria-label={`${bay.name}: ${isActive ? "In Progress" : "Idle"}`}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            isActive ? "bg-status-active" : "bg-status-idle"
          )}
          aria-hidden="true"
        />
        {bay.name}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border shadow-card-sm p-4 transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-sans font-semibold text-sm text-foreground">
          {bay.name}
        </h3>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
            isActive
              ? "bg-status-active/10 text-status-active"
              : "bg-status-idle/10 text-status-idle"
          )}
          aria-live="polite"
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              isActive ? "bg-status-active" : "bg-status-idle"
            )}
            aria-hidden="true"
          />
          {isActive ? "In Progress" : "Idle"}
        </span>
      </div>

      {isActive && currentJob ? (
        <>
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Car className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="font-medium truncate">{currentJob.customer_name}</span>
              {currentJob.plate_number && (
                <span className="text-muted-foreground font-mono text-xs tracking-wide ml-auto">
                  {currentJob.plate_number}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="font-mono tabular-nums text-sm">{elapsed}</span>
              {currentJob.wash_tier && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {currentJob.wash_tier.name}
                </span>
              )}
            </div>
          </div>

          {onComplete && (
            <button
              onClick={() => onComplete(currentJob.id)}
              aria-label={`Mark ${currentJob.customer_name}'s wash done`}
              className="w-full h-14 rounded-lg bg-status-idle text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-status-idle/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-idle/50 focus-visible:ring-offset-2 transition-all duration-150"
            >
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
              Mark Done
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center py-4 gap-2 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center">
            <Car className="w-5 h-5 text-muted-foreground/40" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground/70">Bay is free</p>
        </div>
      )}
    </div>
  );
}
