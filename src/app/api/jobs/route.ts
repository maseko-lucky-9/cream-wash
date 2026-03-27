import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, wash_tier_id, plate_number, source } =
      body;

    if (!customer_name || !customer_phone || !wash_tier_id || !source) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        customer_name,
        customer_phone,
        wash_tier_id,
        plate_number: plate_number || null,
        source,
        status: "queued",
      })
      .select()
      .single();

    if (error) throw error;

    // Calculate queue position
    const { count } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "queued");

    // Get tier duration for wait estimate
    const { data: tier } = await supabase
      .from("wash_tiers")
      .select("duration_minutes")
      .eq("id", wash_tier_id)
      .single();

    const queuePosition = count || 1;
    const estimatedWait = queuePosition * (tier?.duration_minutes || 30);

    return NextResponse.json({
      job: {
        ...job,
        queue_position: queuePosition,
        estimated_wait_minutes: estimatedWait,
      },
    });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
