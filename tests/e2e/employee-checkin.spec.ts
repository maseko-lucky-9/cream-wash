import { test, expect } from "@playwright/test";

test.describe("Employee Check-In Flow", () => {
  test.beforeEach(async ({ request }) => {
    // Seed data before each test
    await request.get("/api/seed");
  });

  test("should show PIN pad and reject invalid PIN", async ({ page }) => {
    await page.goto("/staff");
    await expect(page.getByText("Staff Login")).toBeVisible();

    // Enter invalid PIN
    await page.getByRole("button", { name: "9" }).click();
    await page.getByRole("button", { name: "9" }).click();
    await page.getByRole("button", { name: "9" }).click();
    await page.getByRole("button", { name: "9" }).click();

    await expect(page.getByText("Invalid PIN")).toBeVisible({ timeout: 5000 });
  });

  test("should login with valid staff PIN and see dashboard", async ({ page }) => {
    await page.goto("/staff");

    // Enter Sipho's PIN: 1234
    await page.getByRole("button", { name: "1" }).click();
    await page.getByRole("button", { name: "2" }).click();
    await page.getByRole("button", { name: "3" }).click();
    await page.getByRole("button", { name: "4" }).click();

    await expect(page.getByText("Welcome back,")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Sipho")).toBeVisible();
    await expect(page.getByText("Bay Board")).toBeVisible();
    await expect(page.getByText("Queue")).toBeVisible();
  });

  test("should show bays with correct statuses", async ({ page }) => {
    await page.goto("/staff");

    // Login
    await page.getByRole("button", { name: "1" }).click();
    await page.getByRole("button", { name: "2" }).click();
    await page.getByRole("button", { name: "3" }).click();
    await page.getByRole("button", { name: "4" }).click();

    await expect(page.getByText("Bay Board")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Bay 1")).toBeVisible();
    await expect(page.getByText("Bay 2")).toBeVisible();
    await expect(page.getByText("Bay 3")).toBeVisible();
  });
});
