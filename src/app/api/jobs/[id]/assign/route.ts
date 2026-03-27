import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

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

    const supabase = createServerClient();
    const jobId = params.id;

    // Update the job
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .update({
        bay_id,
        employee_id,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("status", "queued")
      .select()
      .single();

    if (jobErr) throw jobErr;

    // Update the bay
    const { error: bayErr } = await supabase
      .from("bays")
      .update({
        status: "in_progress",
        current_job_id: jobId,
      })
      .eq("id", bay_id);

    if (bayErr) throw bayErr;

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Assign job error:", error);
    return NextResponse.json(
      { error: "Failed to assign job" },
      { status: 500 }
    );
  }
}
