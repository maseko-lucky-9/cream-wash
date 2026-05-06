import { NextResponse } from "next/server";
import { getDB } from "@/lib/mock-db";
import { generateTimeSlots } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "date query parameter is required" }, { status: 400 });
    }

    const db = getDB();
    const totalBays = db.bays.length;

    const bookingCounts: Record<string, number> = {};
    db.bookings
      .filter((b) => b.date === date && b.status === "confirmed")
      .forEach((b) => {
        const slot = b.time_slot.slice(0, 5);
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
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }
}
