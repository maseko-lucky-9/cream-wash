"use client";

import { User, Clock, Tag } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import type { Job, WashTier } from "@/lib/database.types";

interface QueueItemProps {
  job: Job & { wash_tier?: WashTier };
  position: number;
  estimatedWait: number;
  onAssign?: (job: Job) => void;
}

export function QueueItem({ job, position, estimatedWait, onAssign }: QueueItemProps) {
  const isBooking = job.source === "booking";

  return (
    <button
      onClick={() => onAssign?.(job)}
      disabled={!onAssign}
      className={cn(
        "w-full text-left rounded-xl bg-card border border-border shadow-card-sm p-4 transition-all",
        onAssign && "hover:shadow-card-hover hover:-translate-y-px active:scale-[0.99] cursor-pointer",
        onAssign && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2",
        !onAssign && "cursor-default"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
            {position}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">
                {job.customer_name}
              </span>
            </div>
          </div>
        </div>

        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            isBooking
              ? "bg-status-active/10 text-status-active"
              : "bg-status-waiting/10 text-status-waiting"
          )}
        >
          {isBooking ? "Booked" : "Walk-in"}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground ml-9">
        {job.wash_tier && (
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            {job.wash_tier.name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          ~{formatDuration(estimatedWait)} wait
        </span>
        {job.plate_number && (
          <span className="text-muted-foreground/60">{job.plate_number}</span>
        )}
      </div>
    </button>
  );
}
