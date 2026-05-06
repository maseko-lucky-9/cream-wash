import { NextResponse } from "next/server";
import { getDB } from "@/lib/mock-db";

export async function GET() {
  try {
    const db = getDB();

    const now = new Date();
    const sastOffset = 2 * 60;
    const sastDate = new Date(now.getTime() + sastOffset * 60000);
    const todayStr = sastDate.toISOString().split("T")[0];
    const todayStart = `${todayStr}T00:00:00+02:00`;
    const todayEnd = `${todayStr}T23:59:59+02:00`;

    const completedJobs = db.jobs.filter(
      (j) =>
        j.status === "completed" &&
        j.completed_at &&
        j.completed_at >= todayStart &&
        j.completed_at <= todayEnd
    );

    const tierPriceMap = Object.fromEntries(db.wash_tiers.map((t) => [t.id, t.price_zar]));
    const tierDurationMap = Object.fromEntries(db.wash_tiers.map((t) => [t.id, t.duration_minutes]));

    const carsWashed = completedJobs.length;
    const totalRevenueCents = completedJobs.reduce(
      (sum, j) => sum + (tierPriceMap[j.wash_tier_id] || 0),
      0
    );

    let avgWaitMinutes = 0;
    const waits = completedJobs
      .filter((j) => j.started_at && j.queued_at)
      .map((j) => (new Date(j.started_at!).getTime() - new Date(j.queued_at).getTime()) / 60000);
    if (waits.length > 0) {
      avgWaitMinutes = Math.round(waits.reduce((s, w) => s + w, 0) / waits.length);
    }

    const totalBays = db.bays.length;
    const activeBays = db.bays.filter((b) => b.status === "in_progress").length;
    const totalBayMinutesAvailable = totalBays * 10 * 60;
    const totalBusyMinutes = completedJobs.reduce(
      (sum, j) => sum + (tierDurationMap[j.wash_tier_id] || 30),
      0
    );
    const bayUtilizationPct = Math.min(
      100,
      Math.round((totalBusyMinutes / totalBayMinutesAvailable) * 100)
    );

    const queueLength = db.jobs.filter((j) => j.status === "queued").length;

    return NextResponse.json({
      cars_washed: carsWashed,
      total_revenue_cents: totalRevenueCents,
      avg_wait_minutes: avgWaitMinutes,
      bay_utilization_pct: bayUtilizationPct,
      bays: db.bays,
      queue_length: queueLength,
      active_bays: activeBays,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
