import { NextResponse } from "next/server";
import { getDB, comparePin } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== "string" || pin.length !== 4) {
      return NextResponse.json(
        { error: "PIN must be exactly 4 digits" },
        { status: 400 }
      );
    }

    const db = getDB();
    const matched = db.employees.find((emp) => comparePin(pin, emp.pin));

    if (!matched) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    return NextResponse.json({
      employee: { id: matched.id, name: matched.name, role: matched.role },
    });
  } catch (error) {
    console.error("PIN auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
