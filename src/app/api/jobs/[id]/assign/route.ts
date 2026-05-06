import { NextResponse } from "next/server";
import { getDB } from "@/lib/mock-db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { bay_id, employee_id } = await request.json();

    if (!bay_id || !employee_id) {
      return NextResponse.json(
        { error: "bay_id and employee_id are required" },
        { status: 400 }
      );
    }

    const db = getDB();
    const jobId = params.id;

    const job = db.jobs.find((j) => j.id === jobId && j.status === "queued");
    if (!job) {
      return NextResponse.json({ error: "Job not found or not queued" }, { status: 404 });
    }

    job.bay_id = bay_id;
    job.employee_id = employee_id;
    job.status = "in_progress";
    job.started_at = new Date().toISOString();

    const bay = db.bays.find((b) => b.id === bay_id);
    if (bay) {
      bay.status = "in_progress";
      bay.current_job_id = jobId;
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Assign job error:", error);
    return NextResponse.json({ error: "Failed to assign job" }, { status: 500 });
  }
}
