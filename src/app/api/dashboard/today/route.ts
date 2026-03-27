import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Get today's date in SAST
    const now = new Date();
    const sastOffset = 2 * 60; // UTC+2
    const sastDate = new Date(now.getTime() + sastOffset * 60000);
    const todayStr = sastDate.toISOString().split("T")[0];
    const todayStart = `${todayStr}T00:00:00+02:00`;
    const todayEnd = `${todayStr}T23:59:59+02:00`;

    // Get completed jobs today
    const { data: completedJobs } = await supabase
      .from("jobs")
      .select("id, completed_at, started_at, queued_at, bay_id, wash_tier_id")
      .eq("status", "completed")
      .gte("completed_at", todayStart)
      .lte("completed_at", todayEnd);

    // Get wash tier prices
    const { data: tiers } = await supabase
      .from("wash_tiers")
      .select("id, price_zar");

    const tierPriceMap: Record<string, number> = {};
    tiers?.forEach((t) => {
      tierPriceMap[t.id] = t.price_zar;
    });

    const carsWashed = completedJobs?.length || 0;
    const totalRevenueCents = completedJobs?.reduce(
      (sum, j) => sum + (tierPriceMap[j.wash_tier_id] || 0),
      0
    ) || 0;

    // Average wait time (queued_at to started_at) in minutes
    let avgWaitMinutes = 0;
    if (completedJobs && completedJobs.length > 0) {
      const waits = completedJobs
        .filter((j) => j.started_at && j.queued_at)
        .map((j) => {
          const start = new Date(j.started_at!).getTime();
          const queued = new Date(j.queued_at).getTime();
          return (start - queued) / 60000;
        });
      if (waits.length > 0) {
        avgWaitMinutes = Math.round(
          waits.reduce((s, w) => s + w, 0) / waits.length
        );
      }
    }

    // Bay utilization: hours bays were active / total hours open (7am-5pm = 10hrs)
    const { data: allBays } = await supabase.from("bays").select("id, status, current_job_id");
    const totalBays = allBays?.length || 3;
    const activeBays = allBays?.filter((b) => b.status === "in_progress").length || 0;

    // Simple utilization: completed jobs * avg duration / (total bay hours available)
    const totalBayMinutesAvailable = totalBays * 10 * 60; // 3 bays * 10 hours * 60 min
    const { data: tiersForDuration } = await supabase
      .from("wash_tiers")
      .select("id, duration_minutes");
    const tierDurationMap: Record<string, number> = {};
    tiersForDuration?.forEach((t) => {
      tierDurationMap[t.id] = t.duration_minutes;
    });

    const totalBusyMinutes = completedJobs?.reduce(
      (sum, j) => sum + (tierDurationMap[j.wash_tier_id] || 30),
      0
    ) || 0;
    const bayUtilizationPct = Math.min(
      100,
      Math.round((totalBusyMinutes / totalBayMinutesAvailable) * 100)
    );

    // Get queue length
    const { count: queueLength } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "queued");

    return NextResponse.json({
      cars_washed: carsWashed,
      total_revenue_cents: totalRevenueCents,
      avg_wait_minutes: avgWaitMinutes,
      bay_utilization_pct: bayUtilizationPct,
      bays: allBays || [],
      queue_length: queueLength || 0,
      active_bays: activeBays,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
