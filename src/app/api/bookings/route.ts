import { NextResponse } from "next/server";
import { getDB } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, wash_tier_id, date, time_slot } = body;

    if (!customer_name || !customer_phone || !wash_tier_id || !date || !time_slot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDB();
    const totalBays = db.bays.length;

    const existingCount = db.bookings.filter(
      (b) => b.date === date && b.time_slot === time_slot && b.status === "confirmed"
    ).length;

    if (existingCount >= totalBays) {
      return NextResponse.json(
        { error: "This time slot is fully booked. Please choose another time." },
        { status: 409 }
      );
    }

    const booking = {
      id: crypto.randomUUID(),
      customer_name,
      customer_phone,
      wash_tier_id,
      date,
      time_slot,
      status: "confirmed" as const,
      job_id: null,
      created_at: new Date().toISOString(),
    };

    db.bookings.push(booking);

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
