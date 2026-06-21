import { test, expect } from "@playwright/test";
import { capture } from "./helpers/screenshots.js";
import { mockPublicMenu } from "./helpers/routes.js";

test("responsive screenshot artifacts", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await capture(page, testInfo, `landing-${viewport.width}`, viewport);
  }
  await mockPublicMenu(page);
  await page.goto("/menu/menudigi-e2e-cafe?branch=1&table=E01&locale=en");
  await expect(page.getByRole("heading", { name: "MenuDIGI E2E Cafe" })).toBeVisible();
  await capture(page, testInfo, "public-menu-375", { width: 375, height: 812 });
  await page.goto("/menu/menudigi-e2e-cafe?branch=1&table=E01&locale=km");
  await expect(page.getByRole("heading", { name: "MenuDIGI E2E Cafe" })).toBeVisible();
  await capture(page, testInfo, "public-menu-khmer-390", { width: 390, height: 844 });
  await capture(page, testInfo, "public-menu-430", { width: 430, height: 932 });
});
