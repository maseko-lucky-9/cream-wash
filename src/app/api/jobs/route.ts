import { NextResponse } from "next/server";
import { getDB } from "@/lib/mock-db";

export async function GET() {
  const db = getDB();
  const tierMap = Object.fromEntries(db.wash_tiers.map((t) => [t.id, t]));
  const jobs = db.jobs
    .filter((j) => j.status === "queued" || j.status === "in_progress")
    .sort((a, b) => new Date(a.queued_at).getTime() - new Date(b.queued_at).getTime())
    .map((j) => ({ ...j, wash_tier: tierMap[j.wash_tier_id] }));

  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, wash_tier_id, plate_number, source } = body;

    if (!customer_name || !customer_phone || !wash_tier_id || !source) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDB();
    const tier = db.wash_tiers.find((t) => t.id === wash_tier_id);
    if (!tier) {
      return NextResponse.json({ error: "Invalid wash tier" }, { status: 400 });
    }

    const job = {
      id: crypto.randomUUID(),
      customer_name,
      customer_phone,
      wash_tier_id,
      plate_number: plate_number || null,
      source,
      status: "queued" as const,
      bay_id: null,
      employee_id: null,
      queued_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    };

    db.jobs.push(job);

    const queueLength = db.jobs.filter((j) => j.status === "queued").length;
    const estimatedWait = queueLength * tier.duration_minutes;

    return NextResponse.json({
      job: { ...job, queue_position: queueLength, estimated_wait_minutes: estimatedWait },
    });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
