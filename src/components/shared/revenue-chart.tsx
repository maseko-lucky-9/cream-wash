"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { formatZAR } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface DayRevenue {
  date: string;
  label: string;
  revenue: number;
  isToday: boolean;
}

export function RevenueChart() {
  const [data, setData] = useState<DayRevenue[]>([]);

  useEffect(() => {
    async function fetchRevenue() {
      // Generate last 8 days (7 days + today)
      const days: DayRevenue[] = [];
      const today = new Date();

      for (let i = 7; i >= 0; i--) {
        const d = subDays(today, i);
        const dateStr = format(d, "yyyy-MM-dd");
        days.push({
          date: dateStr,
          label: i === 0 ? "Today" : format(d, "EEE"),
          revenue: 0,
          isToday: i === 0,
        });
      }

      // Fetch completed jobs with their tier prices
      const eightDaysAgo = format(subDays(today, 7), "yyyy-MM-dd");
      const { data: jobs } = await supabase
        .from("jobs")
        .select("completed_at, wash_tier_id")
        .eq("status", "completed")
        .gte("completed_at", `${eightDaysAgo}T00:00:00+02:00`);

      const { data: tiers } = await supabase
        .from("wash_tiers")
        .select("id, price_zar");

      if (!jobs || !tiers) return;

      const tierPriceMap: Record<string, number> = {};
      tiers.forEach((t) => (tierPriceMap[t.id] = t.price_zar));

      // Aggregate revenue per day
      const revenueMap: Record<string, number> = {};
      jobs.forEach((j) => {
        if (!j.completed_at) return;
        // Use SAST timezone offset
        const completedDate = new Date(j.completed_at);
        const sastDate = new Date(completedDate.getTime() + 2 * 60 * 60000);
        const dateStr = format(sastDate, "yyyy-MM-dd");
        revenueMap[dateStr] =
          (revenueMap[dateStr] || 0) + (tierPriceMap[j.wash_tier_id] || 0);
      });

      const chartData = days.map((d) => ({
        ...d,
        revenue: revenueMap[d.date] || 0,
      }));

      setData(chartData);
    }

    fetchRevenue();
  }, []);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl glass-card p-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="barGradientToday" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(32, 85%, 50%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(32, 85%, 38%)" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="barGradientDefault" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(30, 10%, 88%)" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(30, 10%, 88%)" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(25, 8%, 32%)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(25, 8%, 32%)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `R${Math.round(v / 100)}`}
          />
          <Tooltip
            formatter={(value) => [formatZAR(Number(value)), "Revenue"]}
            contentStyle={{
              background: "rgba(255, 252, 247, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(28, 25, 23, 0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isToday ? "url(#barGradientToday)" : "url(#barGradientDefault)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
