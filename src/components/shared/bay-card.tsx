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
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
          isActive
            ? "bg-status-active/10 text-status-active"
            : "bg-status-idle/10 text-status-idle"
        )}
      >
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isActive ? "bg-status-active" : "bg-status-idle"
          )}
        />
        {bay.name}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl glass-card p-4 transition-all"
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
        isActive
          ? "bg-gradient-to-b from-status-active to-status-active/50"
          : "bg-gradient-to-b from-status-idle to-status-idle/50"
      )} />
      <div className={cn(
        "absolute left-0 top-1/4 bottom-1/4 w-8 rounded-r-full blur-xl pointer-events-none",
        isActive ? "bg-status-active/8" : "bg-status-idle/8"
      )} />
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-sans font-semibold text-base text-foreground">
          {bay.name}
        </h3>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            isActive
              ? "bg-status-active/10 text-status-active"
              : "bg-status-idle/10 text-status-idle"
          )}
        >
          {isActive ? "In Progress" : "Idle"}
        </span>
      </div>

      {isActive && currentJob ? (
        <>
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{currentJob.customer_name}</span>
              {currentJob.plate_number && (
                <span className="text-muted-foreground">
                  {currentJob.plate_number}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono tabular-nums">{elapsed}</span>
              {currentJob.wash_tier && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted">
                  {currentJob.wash_tier.name}
                </span>
              )}
            </div>
          </div>

          {onComplete && (
            <button
              onClick={() => onComplete(currentJob.id)}
              className="w-full h-[56px] rounded-lg bg-status-idle text-white font-medium flex items-center justify-center gap-2 hover:bg-status-idle/90 active:scale-[0.98] transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              Mark Done
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No car in this bay</p>
      )}
    </div>
  );
}
