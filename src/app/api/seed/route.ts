import { NextResponse } from "next/server";
import { resetDB } from "@/lib/mock-db";

export async function GET() {
  try {
    const db = resetDB();
    return NextResponse.json({
      message: "Seeded successfully",
      counts: {
        employees: db.employees.length,
        bays: db.bays.length,
        tiers: db.wash_tiers.length,
        jobs: db.jobs.length,
        bookings: db.bookings.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed", details: String(error) }, { status: 500 });
  }
}
