import { test, expect } from "@playwright/test";

test.describe("Seed Data", () => {
  test("should seed demo data successfully", async ({ request }) => {
    const response = await request.get("/api/seed");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.message).toBe("Seeded successfully");
    expect(data.counts.employees).toBe(3);
    expect(data.counts.bays).toBe(3);
    expect(data.counts.tiers).toBe(3);
    expect(data.counts.jobs_today).toBeGreaterThan(20);
    expect(data.counts.jobs_historical).toBeGreaterThan(50);
    expect(data.counts.bookings).toBeGreaterThan(0);
  });
});
