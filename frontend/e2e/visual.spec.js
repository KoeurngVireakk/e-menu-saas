import { test, expect } from "@playwright/test";
import { capture } from "./helpers/screenshots.js";
import { mockPublicMenu } from "./helpers/routes.js";

test("responsive screenshot artifacts", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await capture(page, testInfo, "landing-desktop", { width: 1440, height: 900 });
  await capture(page, testInfo, "landing-mobile", { width: 390, height: 844 });
  await mockPublicMenu(page);
  await page.goto("/menu/menudigi-e2e-cafe?branch=1&table=E01&locale=en");
  await capture(page, testInfo, "public-menu-mobile", { width: 390, height: 844 });
});
