"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatZAR } from "@/lib/utils";
import { format } from "date-fns";
import { useMultiRealtime } from "@/lib/hooks/use-realtime";
import type { WashTier, Employee } from "@/lib/database.types";

interface WashEntry {
  id: string;
  completed_at: string;
  tier_name: string;
  employee_name: string;
  price_zar: number;
}

export function WashHistoryLog() {
  const [entries, setEntries] = useState<WashEntry[]>([]);

  const fetchHistory = async () => {
    const today = new Date();
    const sastDate = new Date(today.getTime() + 2 * 60 * 60000);
    const todayStr = format(sastDate, "yyyy-MM-dd");
    const todayStart = `${todayStr}T00:00:00+02:00`;
    const todayEnd = `${todayStr}T23:59:59+02:00`;

    const [jobsRes, tiersRes, employeesRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("id, completed_at, wash_tier_id, employee_id")
        .eq("status", "completed")
        .gte("completed_at", todayStart)
        .lte("completed_at", todayEnd)
        .order("completed_at", { ascending: false }),
      supabase.from("wash_tiers").select("id, name, price_zar"),
      supabase.from("employees").select("id, name"),
    ]);

    const tierMap: Record<string, WashTier> = {};
    tiersRes.data?.forEach((t) => (tierMap[t.id] = t as WashTier));
    const empMap: Record<string, Employee> = {};
    employeesRes.data?.forEach((e) => (empMap[e.id] = e as Employee));

    const mapped: WashEntry[] = (jobsRes.data || []).map((j) => ({
      id: j.id,
      completed_at: j.completed_at!,
      tier_name: tierMap[j.wash_tier_id]?.name || "Unknown",
      employee_name: j.employee_id ? empMap[j.employee_id]?.name || "Unknown" : "Unknown",
      price_zar: tierMap[j.wash_tier_id]?.price_zar || 0,
    }));

    setEntries(mapped);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useMultiRealtime(["jobs"], fetchHistory);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-card-sm p-4 text-center text-sm text-muted-foreground">
        No completed washes today.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-card-sm overflow-hidden">
      <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
        {entries.map((entry) => (
          <div key={entry.id} className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {entry.tier_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  by {entry.employee_name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(entry.completed_at), "HH:mm")}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {formatZAR(entry.price_zar)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
