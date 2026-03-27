import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { hashSync } from "bcryptjs";
import {
  subDays,
  setHours,
  setMinutes,
  addMinutes,
  startOfDay,
} from "date-fns";

// Fixed UUIDs for predictable seed data
const EMPLOYEE_IDS = {
  sipho: "a0000000-0000-0000-0000-000000000001",
  thandi: "a0000000-0000-0000-0000-000000000002",
  owner: "a0000000-0000-0000-0000-000000000003",
};

const BAY_IDS = {
  bay1: "b0000000-0000-0000-0000-000000000001",
  bay2: "b0000000-0000-0000-0000-000000000002",
  bay3: "b0000000-0000-0000-0000-000000000003",
};

const TIER_IDS = {
  basic: "c0000000-0000-0000-0000-000000000001",
  full: "c0000000-0000-0000-0000-000000000002",
  premium: "c0000000-0000-0000-0000-000000000003",
};

const CUSTOMER_NAMES = [
  "Thabo M.",
  "Lerato N.",
  "Pieter V.",
  "Zanele K.",
  "Johan S.",
  "Nomsa D.",
  "David L.",
  "Sibongile M.",
  "Andries P.",
  "Palesa T.",
  "Henk V.",
  "Lindiwe Z.",
  "Francois B.",
  "Mpho G.",
  "Willem J.",
  "Naledi R.",
  "Gerhard K.",
  "Thandiwe S.",
  "Riaan F.",
  "Zodwa N.",
  "Chris M.",
  "Busi H.",
  "Andre W.",
  "Nandi L.",
  "Kobus D.",
];

const PHONE_NUMBERS = CUSTOMER_NAMES.map(
  (_, i) => `07${(10000000 + i * 1111).toString().slice(0, 8)}`
);

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPlate(): string {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  const l3 = letters[Math.floor(Math.random() * letters.length)];
  const nums = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, "0");
  return `${l1}${l2}${l3} ${nums} GP`;
}

export async function GET() {
  const supabase = createServerClient();

  try {
    // Clear existing data (order matters for FK constraints)
    await supabase.from("bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("bays").update({ current_job_id: null }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("jobs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("bays").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("wash_tiers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("employees").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 1. Insert employees
    const employees = [
      {
        id: EMPLOYEE_IDS.sipho,
        name: "Sipho",
        pin: hashSync("1234", 10),
        role: "staff" as const,
      },
      {
        id: EMPLOYEE_IDS.thandi,
        name: "Thandi",
        pin: hashSync("5678", 10),
        role: "staff" as const,
      },
      {
        id: EMPLOYEE_IDS.owner,
        name: "Owner",
        pin: hashSync("0000", 10),
        role: "owner" as const,
      },
    ];
    const { error: empErr } = await supabase.from("employees").insert(employees);
    if (empErr) throw empErr;

    // 2. Insert bays
    const bays = [
      { id: BAY_IDS.bay1, name: "Bay 1", status: "idle" as const },
      { id: BAY_IDS.bay2, name: "Bay 2", status: "idle" as const },
      { id: BAY_IDS.bay3, name: "Bay 3", status: "idle" as const },
    ];
    const { error: bayErr } = await supabase.from("bays").insert(bays);
    if (bayErr) throw bayErr;

    // 3. Insert wash tiers
    const tiers = [
      {
        id: TIER_IDS.basic,
        name: "Basic",
        price_zar: 8000,
        duration_minutes: 30,
        description: "Exterior wash and dry",
        sort_order: 1,
      },
      {
        id: TIER_IDS.full,
        name: "Full",
        price_zar: 15000,
        duration_minutes: 45,
        description: "Exterior wash, interior vacuum and wipe",
        sort_order: 2,
      },
      {
        id: TIER_IDS.premium,
        name: "Premium",
        price_zar: 25000,
        duration_minutes: 60,
        description: "Full detail with polish, leather treatment and air freshener",
        sort_order: 3,
      },
    ];
    const { error: tierErr } = await supabase.from("wash_tiers").insert(tiers);
    if (tierErr) throw tierErr;

    // 4. Generate today's jobs (~25 cars)
    const now = new Date();
    const todayStart = startOfDay(now);
    const tierIds = Object.values(TIER_IDS);
    const tierDurations: Record<string, number> = {
      [TIER_IDS.basic]: 30,
      [TIER_IDS.full]: 45,
      [TIER_IDS.premium]: 60,
    };
    const bayIds = Object.values(BAY_IDS);
    const staffIds = [EMPLOYEE_IDS.sipho, EMPLOYEE_IDS.thandi];
    const todayJobs: Array<Record<string, unknown>> = [];
    let jobCount = 0;

    // Completed jobs today (18 cars, spread from 07:00 to ~2 hours ago)
    for (let i = 0; i < 18; i++) {
      const tierId = randomChoice(tierIds);
      const duration = tierDurations[tierId];
      const queuedHour = 7 + Math.floor((i / 18) * 8); // 07:00 to 15:00
      const queuedMin = Math.floor(Math.random() * 50);
      const queuedAt = setMinutes(setHours(todayStart, queuedHour), queuedMin);
      const waitMin = 2 + Math.floor(Math.random() * 10);
      const startedAt = addMinutes(queuedAt, waitMin);
      const completedAt = addMinutes(startedAt, duration + Math.floor(Math.random() * 10) - 5);

      todayJobs.push({
        wash_tier_id: tierId,
        customer_name: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
        customer_phone: PHONE_NUMBERS[i % PHONE_NUMBERS.length],
        plate_number: randomPlate(),
        source: Math.random() > 0.3 ? "walk_in" : "booking",
        status: "completed",
        bay_id: randomChoice(bayIds),
        employee_id: randomChoice(staffIds),
        queued_at: queuedAt.toISOString(),
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
      });
      jobCount++;
    }

    // In-progress jobs (2 cars, currently being washed)
    for (let i = 0; i < 2; i++) {
      const tierId = randomChoice(tierIds);
      const queuedAt = addMinutes(now, -(15 + Math.floor(Math.random() * 10)));
      const startedAt = addMinutes(queuedAt, 3);
      const bayId = bayIds[i];

      const job = {
        wash_tier_id: tierId,
        customer_name: CUSTOMER_NAMES[18 + i],
        customer_phone: PHONE_NUMBERS[18 + i],
        plate_number: randomPlate(),
        source: "walk_in" as const,
        status: "in_progress" as const,
        bay_id: bayId,
        employee_id: randomChoice(staffIds),
        queued_at: queuedAt.toISOString(),
        started_at: startedAt.toISOString(),
      };
      todayJobs.push(job);
      jobCount++;
    }

    // Queued jobs (3 cars, waiting)
    for (let i = 0; i < 3; i++) {
      const tierId = randomChoice(tierIds);
      const queuedAt = addMinutes(now, -(5 - i * 2));

      todayJobs.push({
        wash_tier_id: tierId,
        customer_name: CUSTOMER_NAMES[20 + i],
        customer_phone: PHONE_NUMBERS[20 + i],
        plate_number: randomPlate(),
        source: i === 0 ? "booking" : "walk_in",
        status: "queued",
        queued_at: queuedAt.toISOString(),
      });
      jobCount++;
    }

    // Insert today's jobs
    const { data: insertedJobs, error: jobErr } = await supabase
      .from("jobs")
      .insert(todayJobs)
      .select("id, status, bay_id");
    if (jobErr) throw jobErr;

    // Update bays with current in-progress jobs
    if (insertedJobs) {
      const inProgressJobs = insertedJobs.filter(
        (j) => j.status === "in_progress" && j.bay_id
      );
      for (const job of inProgressJobs) {
        await supabase
          .from("bays")
          .update({ status: "in_progress", current_job_id: job.id })
          .eq("id", job.bay_id!);
      }
    }

    // 5. Generate 7 days of historical jobs
    let historicalCount = 0;
    for (let daysAgo = 1; daysAgo <= 7; daysAgo++) {
      const day = subDays(todayStart, daysAgo);
      const jobsPerDay = 15 + Math.floor(Math.random() * 15); // 15-29 jobs per day
      const historicalJobs: Array<Record<string, unknown>> = [];

      for (let i = 0; i < jobsPerDay; i++) {
        const tierId = randomChoice(tierIds);
        const duration = tierDurations[tierId];
        const queuedHour = 7 + Math.floor((i / jobsPerDay) * 10);
        const queuedMin = Math.floor(Math.random() * 55);
        const queuedAt = setMinutes(setHours(day, queuedHour), queuedMin);
        const waitMin = 2 + Math.floor(Math.random() * 12);
        const startedAt = addMinutes(queuedAt, waitMin);
        const completedAt = addMinutes(
          startedAt,
          duration + Math.floor(Math.random() * 10) - 5
        );

        historicalJobs.push({
          wash_tier_id: tierId,
          customer_name: randomChoice(CUSTOMER_NAMES),
          customer_phone: randomChoice(PHONE_NUMBERS),
          plate_number: randomPlate(),
          source: Math.random() > 0.3 ? "walk_in" : "booking",
          status: "completed",
          bay_id: randomChoice(bayIds),
          employee_id: randomChoice(staffIds),
          queued_at: queuedAt.toISOString(),
          started_at: startedAt.toISOString(),
          completed_at: completedAt.toISOString(),
        });
        historicalCount++;
      }

      const { error: histErr } = await supabase.from("jobs").insert(historicalJobs);
      if (histErr) throw histErr;
    }

    // 6. Insert a few upcoming bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const upcomingBookings = [
      {
        customer_name: "Sarah V.",
        customer_phone: "0821234567",
        wash_tier_id: TIER_IDS.full,
        date: tomorrowStr,
        time_slot: "09:00",
        status: "confirmed" as const,
      },
      {
        customer_name: "Michael T.",
        customer_phone: "0839876543",
        wash_tier_id: TIER_IDS.premium,
        date: tomorrowStr,
        time_slot: "10:30",
        status: "confirmed" as const,
      },
    ];
    const { error: bookErr } = await supabase
      .from("bookings")
      .insert(upcomingBookings);
    if (bookErr) throw bookErr;

    return NextResponse.json({
      message: "Seeded successfully",
      counts: {
        employees: employees.length,
        bays: bays.length,
        tiers: tiers.length,
        jobs_today: jobCount,
        jobs_historical: historicalCount,
        bookings: upcomingBookings.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
