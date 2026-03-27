import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, wash_tier_id, date, time_slot } = body;

    if (!customer_name || !customer_phone || !wash_tier_id || !date || !time_slot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check availability for this slot
    const { data: bays } = await supabase.from("bays").select("id");
    const totalBays = bays?.length || 3;

    const { count: existingBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("date", date)
      .eq("time_slot", time_slot)
      .eq("status", "confirmed");

    if ((existingBookings || 0) >= totalBays) {
      return NextResponse.json(
        { error: "This time slot is fully booked. Please choose another time." },
        { status: 409 }
      );
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        customer_name,
        customer_phone,
        wash_tier_id,
        date,
        time_slot,
        status: "confirmed",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
