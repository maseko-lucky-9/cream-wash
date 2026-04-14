"use client";

import { Check, Clock, Droplets } from "lucide-react";
import { cn, formatZAR, formatDuration } from "@/lib/utils";
import type { WashTier } from "@/lib/database.types";

interface WashTierCardProps {
  tier: WashTier;
  selected?: boolean;
  onSelect?: (tier: WashTier) => void;
  compact?: boolean;
  mostPopular?: boolean;
}

export function WashTierCard({
  tier,
  selected = false,
  onSelect,
  compact = false,
  mostPopular = false,
}: WashTierCardProps) {
  return (
    <button
      onClick={() => onSelect?.(tier)}
      disabled={!onSelect}
      aria-pressed={onSelect ? selected : undefined}
      className={cn(
        "w-full text-left rounded-xl border p-5 transition-all duration-300 ease-in-out bg-card relative overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2",
        onSelect && "hover:shadow-card-hover hover:-translate-y-1 active:shadow-card-active active:scale-[0.98] active:translate-y-0",
        selected
          ? "border-accent/40 shadow-card-md bg-[image:var(--gradient-card-selected)]"
          : "border-border shadow-card-sm hover:border-accent/20",
        !onSelect && "cursor-default",
        compact && "p-4"
      )}
    >
      {/* Subtle inner highlight on hover — shown via the selected gradient already; add a shimmer overlay */}
      {selected && (
        <span className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-inset ring-accent/20" aria-hidden="true" />
      )}

      {/* Right-top indicator: popular badge OR selected checkmark (mutually exclusive) */}
      {!selected && mostPopular && !compact && (
        <span className="absolute top-3.5 right-3.5 inline-flex items-center text-[10px] font-semibold text-accent bg-accent/10 border border-accent/15 px-2 py-0.5 rounded-full tracking-wider uppercase">
          Popular
        </span>
      )}
      {selected && !compact && (
        <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-sm">
          <Check className="w-3 h-3 text-white" strokeWidth={3} aria-hidden="true" />
        </span>
      )}

      <div className="flex items-start justify-between mb-2.5">
        <h3 className={cn(
          "font-display font-semibold text-foreground pr-8 tracking-tight",
          compact ? "text-base" : "text-lg"
        )}>
          {tier.name}
        </h3>
        <span className={cn(
          "font-sans font-semibold tabular-nums shrink-0",
          compact ? "text-lg" : "text-xl",
          "text-accent"
        )}>
          {formatZAR(tier.price_zar)}
        </span>
      </div>

      {tier.description && !compact && (
        <p className="text-sm text-muted-foreground mb-3.5 leading-relaxed">{tier.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
          ~{formatDuration(tier.duration_minutes)}
        </span>
        <span className="flex items-center gap-1.5">
          <Droplets className="w-4 h-4 shrink-0" aria-hidden="true" />
          {tier.name}
        </span>
      </div>
    </button>
  );
}
