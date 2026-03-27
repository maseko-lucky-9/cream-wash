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
}

export function KpiCard({
  label,
  value,
  format = (v) => v.toString(),
  icon: Icon,
  color = "text-foreground",
}: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate count-up
  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 300;
    const steps = 20;
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

  return (
    <div className="rounded-xl border bg-card shadow-card-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-5 h-5", color)} />
        <span className="text-kpi-label text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-kpi tabular-nums font-sans", color)}>
        {format(displayValue)}
      </p>
    </div>
  );
}
