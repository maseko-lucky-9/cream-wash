"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number;
  format?: (value: number) => string;
  icon: LucideIcon;
  color?: string;
  iconBg?: string;
  loading?: boolean;
}

// Map icon color token → tinted background for the icon container
const colorToBg: Record<string, string> = {
  "text-accent": "bg-accent/10",
  "text-status-waiting": "bg-status-waiting/10",
  "text-status-active": "bg-status-active/10",
  "text-status-idle": "bg-status-idle/10",
  "text-foreground": "bg-foreground/[0.07]",
};

// Map icon color token → subtle top accent bar
const colorToBar: Record<string, string> = {
  "text-accent": "from-accent/30 via-accent/15 to-transparent",
  "text-status-waiting": "from-status-waiting/30 via-status-waiting/15 to-transparent",
  "text-status-active": "from-status-active/30 via-status-active/15 to-transparent",
  "text-status-idle": "from-status-idle/30 via-status-idle/15 to-transparent",
  "text-foreground": "from-foreground/15 via-foreground/8 to-transparent",
};

function KpiSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border shadow-card-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg skeleton shrink-0" />
        <div className="h-3.5 w-24 rounded-md skeleton" />
      </div>
      <div className="h-9 w-28 rounded-lg skeleton" />
    </div>
  );
}

export function KpiCard({
  label,
  value,
  format = (v) => v.toString(),
  icon: Icon,
  color = "text-foreground",
  iconBg,
  loading = false,
}: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 400;
    const steps = 24;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = value / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  if (loading) return <KpiSkeleton />;

  const resolvedIconBg = iconBg ?? colorToBg[color] ?? "bg-muted/70";
  const barGradient = colorToBar[color] ?? "from-foreground/10 to-transparent";

  return (
    <div className="relative rounded-xl bg-card border border-border shadow-card-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-in-out p-5 overflow-hidden">
      {/* Subtle top accent bar */}
      <div
        className={cn("absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r", barGradient)}
        aria-hidden="true"
      />
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", resolvedIconBg)}>
          <Icon className={cn("w-[18px] h-[18px]", color)} aria-hidden="true" />
        </div>
        <span className="text-kpi-label text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-kpi tabular-nums font-display tracking-tight", color)}>
        {format(displayValue)}
      </p>
    </div>
  );
}
