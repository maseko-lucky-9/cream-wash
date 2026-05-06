import { NextResponse } from "next/server";
import { getDB } from "@/lib/mock-db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await request.json();
    const db = getDB();
    const jobId = params.id;

    const job = db.jobs.find((j) => j.id === jobId && j.status === "in_progress");
    if (!job) {
      return NextResponse.json({ error: "Job not found or not in progress" }, { status: 404 });
    }

    const bayId = job.bay_id;
    job.status = "completed";
    job.completed_at = new Date().toISOString();

    if (bayId) {
      const bay = db.bays.find((b) => b.id === bayId);
      if (bay) {
        bay.status = "idle";
        bay.current_job_id = null;
      }
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Complete job error:", error);
    return NextResponse.json({ error: "Failed to complete job" }, { status: 500 });
  }
}
