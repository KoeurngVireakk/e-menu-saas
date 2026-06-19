import { test, expect } from "@playwright/test";
import { mockAdmin } from "./helpers/routes.js";

test("admin shell and command palette navigate", async ({ page }) => {
  await mockAdmin(page);
  await page.goto("/admin");
  await expect(page.getByRole("main").getByRole("heading", { name: "Operations Dashboard" })).toBeVisible();
  await page.keyboard.press("Control+K");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  await page.getByRole("button", { name: /Go to products/ }).click();
  await expect(page).toHaveURL(/\/admin\/products/);
});
