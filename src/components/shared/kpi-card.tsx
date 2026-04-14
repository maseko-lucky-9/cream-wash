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
  loading?: boolean;
}

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

  return (
    <div className="rounded-xl bg-card border border-border shadow-card-sm hover:shadow-card-md transition-shadow duration-300 ease-in-out p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-muted/70 flex items-center justify-center shrink-0">
          <Icon className={cn("w-[18px] h-[18px]", color)} aria-hidden="true" />
        </div>
        <span className="text-kpi-label text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-kpi tabular-nums font-sans tracking-tight", color)}>
        {format(displayValue)}
      </p>
    </div>
  );
}
