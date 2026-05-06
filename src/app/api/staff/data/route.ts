import { NextResponse } from "next/server";
import { getDB } from "@/lib/mock-db";

export async function GET() {
  const db = getDB();
  const tierMap = Object.fromEntries(db.wash_tiers.map((t) => [t.id, t]));

  const jobs = db.jobs
    .filter((j) => j.status === "queued" || j.status === "in_progress")
    .sort((a, b) => new Date(a.queued_at).getTime() - new Date(b.queued_at).getTime())
    .map((j) => ({ ...j, wash_tier: tierMap[j.wash_tier_id] }));

  return NextResponse.json({
    bays: db.bays.sort((a, b) => a.name.localeCompare(b.name)),
    jobs,
    tiers: db.wash_tiers.sort((a, b) => a.sort_order - b.sort_order),
  });
}
