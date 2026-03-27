import { test, expect } from "@playwright/test";

test.describe("Walk-In Check-In Flow", () => {
  test.beforeEach(async ({ request }) => {
    await request.get("/api/seed");
  });

  test("should display check-in page with tier selection", async ({ page }) => {
    await page.goto("/checkin");
    await expect(page.getByText("Walk-In Check-In")).toBeVisible();
    await expect(page.getByText("Basic")).toBeVisible();
    await expect(page.getByText("Full")).toBeVisible();
    await expect(page.getByText("Premium")).toBeVisible();
  });

  test("should complete walk-in check-in flow", async ({ page }) => {
    await page.goto("/checkin");

    // Select a tier
    await page.getByText("Basic").first().click();

    // Fill details
    await expect(page.getByText("Enter your details")).toBeVisible();
    await page.getByPlaceholder("Your name").fill("Test Customer");
    await page.getByPlaceholder("082 123 4567").fill("0821234567");

    // Submit
    await page.getByRole("button", { name: /Check In/i }).click();

    // Verify confirmation
    await expect(page.getByText("You are checked in")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Your position")).toBeVisible();
    await expect(page.getByText("Estimated wait")).toBeVisible();
  });

  test("should show validation errors for missing fields", async ({ page }) => {
    await page.goto("/checkin");

    // Select tier
    await page.getByText("Full").first().click();

    // Try to submit without filling details
    await page.getByRole("button", { name: /Check In/i }).click();
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Phone number is required")).toBeVisible();
  });
});
