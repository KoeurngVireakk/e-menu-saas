import { test, expect } from "@playwright/test";
import { loginAsOwner } from "./helpers/auth.js";
import { mockAdmin } from "./helpers/routes.js";

test("auth pages load and owner login reaches admin", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create workspace" })).toBeVisible();
  await mockAdmin(page);
  await loginAsOwner(page);
});
