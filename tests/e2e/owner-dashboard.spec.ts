import { test, expect } from "@playwright/test";

test.describe("Owner Dashboard", () => {
  test.beforeEach(async ({ request }) => {
    await request.get("/api/seed");
  });

  test("should show PIN pad and reject non-owner PIN", async ({ page }) => {
    await page.goto("/owner");
    await expect(page.getByText("Owner Login")).toBeVisible();

    // Try staff PIN (should be rejected)
    await page.getByRole("button", { name: "1" }).click();
    await page.getByRole("button", { name: "2" }).click();
    await page.getByRole("button", { name: "3" }).click();
    await page.getByRole("button", { name: "4" }).click();

    await expect(page.getByText("Owner PIN required")).toBeVisible({ timeout: 5000 });
  });

  test("should login with owner PIN and show KPI cards", async ({ page }) => {
    await page.goto("/owner");

    // Enter owner PIN: 0000
    await page.getByRole("button", { name: "0" }).click();
    await page.getByRole("button", { name: "0" }).click();
    await page.getByRole("button", { name: "0" }).click();
    await page.getByRole("button", { name: "0" }).click();

    // Verify KPI cards
    await expect(page.getByText("Cars Today")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Revenue")).toBeVisible();
    await expect(page.getByText("Avg Wait")).toBeVisible();
    await expect(page.getByText("Bay Utilization")).toBeVisible();

    // Verify bay status section
    await expect(page.getByText("Bay Status")).toBeVisible();

    // Verify P1 features
    await expect(page.getByText("7-Day Revenue")).toBeVisible();
    await expect(page.getByText("Today's Washes")).toBeVisible();
  });
});
