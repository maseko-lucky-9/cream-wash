import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await request.json(); // consume body (employee_id for audit trail)
    const supabase = createServerClient();
    const jobId = params.id;

    // Get the job to find bay_id
    const { data: existingJob } = await supabase
      .from("jobs")
      .select("bay_id")
      .eq("id", jobId)
      .single();

    // Update the job
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("status", "in_progress")
      .select()
      .single();

    if (jobErr) throw jobErr;

    // Update the bay back to idle
    if (existingJob?.bay_id) {
      const { error: bayErr } = await supabase
        .from("bays")
        .update({
          status: "idle",
          current_job_id: null,
        })
        .eq("id", existingJob.bay_id);

      if (bayErr) throw bayErr;
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Complete job error:", error);
    return NextResponse.json(
      { error: "Failed to complete job" },
      { status: 500 }
    );
  }
}
