"use client";

import { useState, useEffect, useCallback } from "react";
import { LogOut, Users, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { PinPad } from "@/components/shared/pin-pad";
import { BayCard } from "@/components/shared/bay-card";
import { QueueItem } from "@/components/shared/queue-item";
import { AssignBaySheet } from "@/components/shared/assign-bay-sheet";
import { useMultiRealtime } from "@/lib/hooks/use-realtime";
import { supabase } from "@/lib/supabase";
import type { Employee, Bay, Job, WashTier } from "@/lib/database.types";

type JobWithTier = Job & { wash_tier?: WashTier };
type BayWithJob = Bay & { currentJob?: JobWithTier | null };

export default function StaffPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [bays, setBays] = useState<BayWithJob[]>([]);
  const [queue, setQueue] = useState<JobWithTier[]>([]);
  const [tiers, setTiers] = useState<WashTier[]>([]);
  const [assigningJob, setAssigningJob] = useState<Job | null>(null);
  const [, setLoading] = useState(false);

  // Check for saved session
  useEffect(() => {
    const saved = localStorage.getItem("cream_staff");
    if (saved) {
      try {
        const emp = JSON.parse(saved);
        if (emp.role === "staff" || emp.role === "owner") {
          setEmployee(emp);
        }
      } catch {}
    }
  }, []);

  // PIN auth handler
  const handlePin = async (pin: string) => {
    setAuthError(null);
    const res = await fetch("/api/auth/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || "Invalid PIN");
      return;
    }
    localStorage.setItem("cream_staff", JSON.stringify(data.employee));
    setEmployee(data.employee);
  };

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!employee) return;

    const [baysRes, jobsRes, tiersRes] = await Promise.all([
      supabase.from("bays").select("*").order("name"),
      supabase.from("jobs").select("*").in("status", ["queued", "in_progress"]).order("queued_at"),
      supabase.from("wash_tiers").select("*").order("sort_order"),
    ]);

    const allTiers = tiersRes.data || [];
    setTiers(allTiers);
    const tierMap: Record<string, WashTier> = {};
    allTiers.forEach((t) => (tierMap[t.id] = t));

    const allJobs = (jobsRes.data || []).map((j) => ({
      ...j,
      wash_tier: tierMap[j.wash_tier_id],
    }));

    const allBays = (baysRes.data || []).map((bay) => {
      const currentJob = bay.current_job_id
        ? allJobs.find((j) => j.id === bay.current_job_id) || null
        : null;
      return { ...bay, currentJob };
    });

    setBays(allBays);
    setQueue(allJobs.filter((j) => j.status === "queued"));
  }, [employee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscriptions
  useMultiRealtime(["bays", "jobs"], fetchData);

  // Assign job to bay
  const handleAssign = async (jobId: string, bayId: string) => {
    if (!employee) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bay_id: bayId, employee_id: employee.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Car assigned to bay");
      await fetchData();
    } catch (err) {
      toast.error("Failed to assign: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Complete a job
  const handleComplete = async (jobId: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employee.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Job completed");
      await fetchData();
    } catch (err) {
      toast.error("Failed to complete: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("cream_staff");
    setEmployee(null);
  };

  // PIN gate
  if (!employee) {
    return <PinPad onSubmit={handlePin} title="Staff Login" error={authError} />;
  }

  // Calculate average tier duration for wait estimates
  const avgDuration =
    tiers.length > 0
      ? Math.round(tiers.reduce((s, t) => s + t.duration_minutes, 0) / tiers.length)
      : 30;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="font-display font-semibold text-foreground">
              {employee.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="h-10 px-3 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* Bay Board */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-display font-semibold text-lg text-foreground">
              Bay Board
            </h2>
          </div>
          <div className="space-y-3">
            {bays.map((bay) => (
              <BayCard
                key={bay.id}
                bay={bay}
                currentJob={bay.currentJob}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </section>

        {/* Queue */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-display font-semibold text-lg text-foreground">
              Queue
            </h2>
            {queue.length > 0 && (
              <span className="ml-auto text-sm font-medium text-accent">
                {queue.length} waiting
              </span>
            )}
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-medium">No cars waiting</p>
              <p className="text-sm mt-1">Cars will appear here when customers check in or book.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((job, i) => (
                <QueueItem
                  key={job.id}
                  job={job}
                  position={i + 1}
                  estimatedWait={(i + 1) * avgDuration}
                  onAssign={(j) => setAssigningJob(j)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Assign Bay Sheet */}
      {assigningJob && (
        <AssignBaySheet
          job={assigningJob}
          bays={bays}
          onAssign={handleAssign}
          onClose={() => setAssigningJob(null)}
        />
      )}
    </div>
  );
}
