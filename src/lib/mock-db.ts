import { hashSync, compareSync } from "bcryptjs";
import { subDays, setHours, setMinutes, addMinutes, startOfDay } from "date-fns";
import type { Employee, Bay, WashTier, Job, Booking } from "@/lib/database.types";

declare global {
  // eslint-disable-next-line no-var
  var _creamWashDB: MockDB | undefined;
}

interface MockDB {
  employees: Employee[];
  bays: Bay[];
  wash_tiers: WashTier[];
  jobs: Job[];
  bookings: Booking[];
}

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
  "Thabo M.", "Lerato N.", "Pieter V.", "Zanele K.", "Johan S.",
  "Nomsa D.", "David L.", "Sibongile M.", "Andries P.", "Palesa T.",
  "Henk V.", "Lindiwe Z.", "Francois B.", "Mpho G.", "Willem J.",
  "Naledi R.", "Gerhard K.", "Thandiwe S.", "Riaan F.", "Zodwa N.",
  "Chris M.", "Busi H.", "Andre W.", "Nandi L.", "Kobus D.",
];

const PHONE_NUMBERS = CUSTOMER_NAMES.map(
  (_, i) => `07${(10000000 + i * 1111).toString().slice(0, 8)}`
);

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPlate(): string {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const l = (n: number) => letters[Math.floor(Math.random() * n)];
  const nums = Math.floor(Math.random() * 999).toString().padStart(3, "0");
  return `${l(letters.length)}${l(letters.length)}${l(letters.length)} ${nums} GP`;
}

function newId(): string {
  return crypto.randomUUID();
}

function seedDB(): MockDB {
  const now = new Date();
  const todayStart = startOfDay(now);

  const employees: Employee[] = [
    { id: EMPLOYEE_IDS.sipho, name: "Sipho", pin: hashSync("1234", 10), role: "staff", created_at: now.toISOString() },
    { id: EMPLOYEE_IDS.thandi, name: "Thandi", pin: hashSync("5678", 10), role: "staff", created_at: now.toISOString() },
    { id: EMPLOYEE_IDS.owner, name: "Owner", pin: hashSync("0000", 10), role: "owner", created_at: now.toISOString() },
  ];

  const bays: Bay[] = [
    { id: BAY_IDS.bay1, name: "Bay 1", status: "idle", current_job_id: null, created_at: now.toISOString() },
    { id: BAY_IDS.bay2, name: "Bay 2", status: "idle", current_job_id: null, created_at: now.toISOString() },
    { id: BAY_IDS.bay3, name: "Bay 3", status: "idle", current_job_id: null, created_at: now.toISOString() },
  ];

  const wash_tiers: WashTier[] = [
    { id: TIER_IDS.basic, name: "Basic", price_zar: 8000, duration_minutes: 30, description: "Exterior wash and dry", sort_order: 1, created_at: now.toISOString() },
    { id: TIER_IDS.full, name: "Full", price_zar: 15000, duration_minutes: 45, description: "Exterior wash, interior vacuum and wipe", sort_order: 2, created_at: now.toISOString() },
    { id: TIER_IDS.premium, name: "Premium", price_zar: 25000, duration_minutes: 60, description: "Full detail with polish, leather treatment and air freshener", sort_order: 3, created_at: now.toISOString() },
  ];

  const tierDurations: Record<string, number> = {
    [TIER_IDS.basic]: 30,
    [TIER_IDS.full]: 45,
    [TIER_IDS.premium]: 60,
  };

  const tierIds = Object.values(TIER_IDS);
  const bayIds = Object.values(BAY_IDS);
  const staffIds = [EMPLOYEE_IDS.sipho, EMPLOYEE_IDS.thandi];

  const jobs: Job[] = [];

  // 18 completed jobs today (07:00-15:00)
  for (let i = 0; i < 18; i++) {
    const tierId = randomChoice(tierIds);
    const duration = tierDurations[tierId];
    const queuedHour = 7 + Math.floor((i / 18) * 8);
    const queuedMin = Math.floor(Math.random() * 50);
    const queuedAt = setMinutes(setHours(todayStart, queuedHour), queuedMin);
    const waitMin = 2 + Math.floor(Math.random() * 10);
    const startedAt = addMinutes(queuedAt, waitMin);
    const completedAt = addMinutes(startedAt, duration + Math.floor(Math.random() * 10) - 5);

    jobs.push({
      id: newId(),
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
      created_at: queuedAt.toISOString(),
    });
  }

  // 2 in_progress jobs (use bay1, bay2)
  const inProgressBayIds = [BAY_IDS.bay1, BAY_IDS.bay2];
  for (let i = 0; i < 2; i++) {
    const tierId = randomChoice(tierIds);
    const queuedAt = addMinutes(now, -(15 + Math.floor(Math.random() * 10)));
    const startedAt = addMinutes(queuedAt, 3);
    const jobId = newId();

    jobs.push({
      id: jobId,
      wash_tier_id: tierId,
      customer_name: CUSTOMER_NAMES[18 + i],
      customer_phone: PHONE_NUMBERS[18 + i],
      plate_number: randomPlate(),
      source: "walk_in",
      status: "in_progress",
      bay_id: inProgressBayIds[i],
      employee_id: randomChoice(staffIds),
      queued_at: queuedAt.toISOString(),
      started_at: startedAt.toISOString(),
      completed_at: null,
      created_at: queuedAt.toISOString(),
    });

    // Update bay
    const bay = bays.find((b) => b.id === inProgressBayIds[i]);
    if (bay) {
      bay.status = "in_progress";
      bay.current_job_id = jobId;
    }
  }

  // 3 queued jobs
  for (let i = 0; i < 3; i++) {
    const tierId = randomChoice(tierIds);
    const queuedAt = addMinutes(now, -(5 - i * 2));

    jobs.push({
      id: newId(),
      wash_tier_id: tierId,
      customer_name: CUSTOMER_NAMES[20 + i],
      customer_phone: PHONE_NUMBERS[20 + i],
      plate_number: randomPlate(),
      source: i === 0 ? "booking" : "walk_in",
      status: "queued",
      bay_id: null,
      employee_id: null,
      queued_at: queuedAt.toISOString(),
      started_at: null,
      completed_at: null,
      created_at: queuedAt.toISOString(),
    });
  }

  // 7 days of historical completed jobs
  for (let daysAgo = 1; daysAgo <= 7; daysAgo++) {
    const day = subDays(todayStart, daysAgo);
    const jobsPerDay = 15 + Math.floor(Math.random() * 15);

    for (let i = 0; i < jobsPerDay; i++) {
      const tierId = randomChoice(tierIds);
      const duration = tierDurations[tierId];
      const queuedHour = 7 + Math.floor((i / jobsPerDay) * 10);
      const queuedMin = Math.floor(Math.random() * 55);
      const queuedAt = setMinutes(setHours(day, queuedHour), queuedMin);
      const waitMin = 2 + Math.floor(Math.random() * 12);
      const startedAt = addMinutes(queuedAt, waitMin);
      const completedAt = addMinutes(startedAt, duration + Math.floor(Math.random() * 10) - 5);

      jobs.push({
        id: newId(),
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
        created_at: queuedAt.toISOString(),
      });
    }
  }

  // Upcoming bookings
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const bookings: Booking[] = [
    {
      id: newId(),
      customer_name: "Sarah V.",
      customer_phone: "0821234567",
      wash_tier_id: TIER_IDS.full,
      date: tomorrowStr,
      time_slot: "09:00",
      status: "confirmed",
      job_id: null,
      created_at: now.toISOString(),
    },
    {
      id: newId(),
      customer_name: "Michael T.",
      customer_phone: "0839876543",
      wash_tier_id: TIER_IDS.premium,
      date: tomorrowStr,
      time_slot: "10:30",
      status: "confirmed",
      job_id: null,
      created_at: now.toISOString(),
    },
  ];

  return { employees, bays, wash_tiers, jobs, bookings };
}

export function getDB(): MockDB {
  if (!global._creamWashDB) {
    global._creamWashDB = seedDB();
  }
  return global._creamWashDB;
}

export function resetDB(): MockDB {
  global._creamWashDB = seedDB();
  return global._creamWashDB;
}

export function comparePin(pin: string, hash: string): boolean {
  return compareSync(pin, hash);
}
