import { test, expect } from "@playwright/test";

test.describe("Customer Booking Flow", () => {
  test.beforeEach(async ({ request }) => {
    await request.get("/api/seed");
  });

  test("should display landing page with wash tiers", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Cream Car Wash")).toBeVisible();
    await expect(page.getByText("Premium Car Wash")).toBeVisible();
    await expect(page.getByText("Book a Wash")).toBeVisible();

    // Check tier cards
    await expect(page.getByText("Basic")).toBeVisible();
    await expect(page.getByText("Full")).toBeVisible();
    await expect(page.getByText("Premium")).toBeVisible();
  });

  test("should navigate through booking flow", async ({ page }) => {
    await page.goto("/");

    // Click Book a Wash
    await page.getByRole("button", { name: /Book a Wash/i }).click();
    await expect(page.getByText("Choose your wash")).toBeVisible({ timeout: 5000 });

    // Select Full wash
    await page.getByText("Full").first().click();
    await expect(page.getByText("Pick a date")).toBeVisible({ timeout: 5000 });

    // Select first date (Today)
    await page.getByText("Today").click();
    await expect(page.getByText("Select a time")).toBeVisible({ timeout: 5000 });
  });
});
