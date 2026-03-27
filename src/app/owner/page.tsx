"use client";

import { useState, useEffect, useCallback } from "react";
import { LogOut, Car, DollarSign, Clock, BarChart3, Loader2 } from "lucide-react";
import { PinPad } from "@/components/shared/pin-pad";
import { KpiCard } from "@/components/shared/kpi-card";
import { BayCard } from "@/components/shared/bay-card";
import { RevenueChart } from "@/components/shared/revenue-chart";
import { WashHistoryLog } from "@/components/shared/wash-history-log";
import { useMultiRealtime } from "@/lib/hooks/use-realtime";
import { formatZAR } from "@/lib/utils";
import type { Employee, Bay } from "@/lib/database.types";

interface DashboardData {
  cars_washed: number;
  total_revenue_cents: number;
  avg_wait_minutes: number;
  bay_utilization_pct: number;
  bays: Bay[];
  queue_length: number;
}

export default function OwnerPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check saved session
  useEffect(() => {
    const saved = localStorage.getItem("cream_owner");
    if (saved) {
      try {
        const emp = JSON.parse(saved);
        if (emp.role === "owner") setEmployee(emp);
      } catch {}
    }
  }, []);

  // PIN auth
  const handlePin = async (pin: string) => {
    setAuthError(null);
    const res = await fetch("/api/auth/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const resData = await res.json();
    if (!res.ok) {
      setAuthError(resData.error || "Invalid PIN");
      return;
    }
    if (resData.employee.role !== "owner") {
      setAuthError("Owner PIN required");
      return;
    }
    localStorage.setItem("cream_owner", JSON.stringify(resData.employee));
    setEmployee(resData.employee);
  };

  // Fetch dashboard
  const fetchDashboard = useCallback(async () => {
    if (!employee) return;
    try {
      const res = await fetch("/api/dashboard/today");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Real-time
  useMultiRealtime(["bays", "jobs"], fetchDashboard);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("cream_owner");
    setEmployee(null);
  };

  if (!employee) {
    return <PinPad onSubmit={handlePin} title="Owner Login" error={authError} />;
  }

  return (
    <div className="min-h-screen bg-background pb-8 relative">
      {/* Ambient background glow */}
      <div className="fixed top-10 right-1/4 w-[350px] h-[350px] rounded-full bg-accent/[0.03] blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="fixed bottom-1/3 left-1/3 w-[250px] h-[250px] rounded-full bg-gold-400/[0.03] blur-[80px] pointer-events-none" aria-hidden="true" />
      {/* Header */}
      <header className="sticky top-0 z-40 glass-surface border-b border-white/30 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-sm text-muted-foreground">Dashboard</p>
            <p className="font-display font-semibold text-foreground">
              Cream Car Wash
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="h-10 px-3 rounded-lg glass-surface border-white/30 text-sm font-medium text-muted-foreground hover:bg-white/30 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-lg md:max-w-3xl mx-auto px-4 mt-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards + Bay Status — responsive side-by-side at md+ */}
            <div className="md:grid md:grid-cols-[1fr_auto] md:gap-6 md:items-start">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-3">
                <KpiCard
                  label="Cars Today"
                  value={data.cars_washed}
                  icon={Car}
                  color="text-foreground"
                />
                <KpiCard
                  label="Revenue"
                  value={data.total_revenue_cents}
                  format={(v) => formatZAR(v)}
                  icon={DollarSign}
                  color="text-accent"
                />
                <KpiCard
                  label="Avg Wait"
                  value={data.avg_wait_minutes}
                  format={(v) => `${v} min`}
                  icon={Clock}
                  color="text-status-waiting"
                />
                <KpiCard
                  label="Bay Utilization"
                  value={data.bay_utilization_pct}
                  format={(v) => `${v}%`}
                  icon={BarChart3}
                  color="text-status-active"
                />
              </div>

              {/* Bay Status */}
              <section className="mt-6 md:mt-0 md:min-w-[180px]">
                <h2 className="text-sm font-medium text-muted-foreground mb-2">
                  Bay Status
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {data.bays.map((bay) => (
                    <BayCard key={bay.id} bay={bay} compact />
                  ))}
                </div>
                {data.queue_length > 0 && (
                  <p className="text-sm text-status-waiting mt-2">
                    {data.queue_length} car{data.queue_length !== 1 ? "s" : ""} in queue
                  </p>
                )}
              </section>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />

            {/* P1: Revenue Chart */}
            <section>
              <h2 className="font-display font-semibold text-lg text-foreground mb-3">
                7-Day Revenue
              </h2>
              <RevenueChart />
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />

            {/* P1: Wash History Log */}
            <section>
              <h2 className="font-display font-semibold text-lg text-foreground mb-3">
                Today&apos;s Washes
              </h2>
              <WashHistoryLog />
            </section>
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-medium">No data available</p>
            <p className="text-sm mt-1">
              Visit <code className="text-accent">/api/seed</code> to load demo data.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
