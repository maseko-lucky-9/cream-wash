import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateTimeSlots } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "date query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get total bays
    const { data: bays } = await supabase.from("bays").select("id");
    const totalBays = bays?.length || 3;

    // Get all confirmed bookings for this date
    const { data: bookings } = await supabase
      .from("bookings")
      .select("time_slot")
      .eq("date", date)
      .eq("status", "confirmed");

    // Count bookings per slot
    const bookingCounts: Record<string, number> = {};
    bookings?.forEach((b) => {
      const slot = b.time_slot.slice(0, 5); // normalize "09:00:00" to "09:00"
      bookingCounts[slot] = (bookingCounts[slot] || 0) + 1;
    });

    const slots = generateTimeSlots().map((time) => ({
      time,
      available: (bookingCounts[time] || 0) < totalBays,
      remaining: totalBays - (bookingCounts[time] || 0),
    }));

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
