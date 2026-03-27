import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { compareSync } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== "string" || pin.length !== 4) {
      return NextResponse.json(
        { error: "PIN must be exactly 4 digits" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: employees, error } = await supabase
      .from("employees")
      .select("*");

    if (error) throw error;
    if (!employees || employees.length === 0) {
      return NextResponse.json({ error: "No employees found" }, { status: 404 });
    }

    // Compare PIN hash for each employee (small table, acceptable for demo)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matched = (employees as any[]).find((emp) =>
      compareSync(pin, emp.pin)
    );

    if (!matched) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    return NextResponse.json({
      employee: {
        id: matched.id,
        name: matched.name,
        role: matched.role,
      },
    });
  } catch (error) {
    console.error("PIN auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
