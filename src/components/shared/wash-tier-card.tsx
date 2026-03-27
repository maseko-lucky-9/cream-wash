"use client";

import { Clock, Droplets } from "lucide-react";
import { cn, formatZAR, formatDuration } from "@/lib/utils";
import type { WashTier } from "@/lib/database.types";

interface WashTierCardProps {
  tier: WashTier;
  selected?: boolean;
  onSelect?: (tier: WashTier) => void;
  compact?: boolean;
}

export function WashTierCard({
  tier,
  selected = false,
  onSelect,
  compact = false,
}: WashTierCardProps) {
  return (
    <button
      onClick={() => onSelect?.(tier)}
      disabled={!onSelect}
      className={cn(
        "w-full text-left rounded-xl border-2 bg-card p-4 transition-all shadow-card-sm",
        "hover:shadow-card-md active:scale-[0.98]",
        selected
          ? "border-accent shadow-card-md"
          : "border-border",
        !onSelect && "cursor-default",
        compact && "p-3"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={cn(
          "font-display font-semibold text-foreground",
          compact ? "text-base" : "text-lg"
        )}>
          {tier.name}
        </h3>
        <span className={cn(
          "font-sans font-semibold tabular-nums",
          compact ? "text-lg" : "text-xl",
          selected ? "text-accent" : "text-foreground"
        )}>
          {formatZAR(tier.price_zar)}
        </span>
      </div>

      {tier.description && !compact && (
        <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          ~{formatDuration(tier.duration_minutes)}
        </span>
        <span className="flex items-center gap-1.5">
          <Droplets className="w-4 h-4" />
          {tier.name}
        </span>
      </div>
    </button>
  );
}
