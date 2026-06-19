import { test, expect } from "@playwright/test";
import { protectConsole } from "./helpers/console.js";
import { expectNoCriticalViolations } from "./helpers/accessibility.js";

test("landing conversion and language smoke", async ({ page }) => {
  const verifyConsole = protectConsole(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Run your restaurant menu");
  await expect(page.getByRole("main").getByRole("link", { name: "Get started" }).first()).toBeVisible();
  await expect(page.getByLabel("MenuDIGI mobile ordering preview")).toBeVisible();
  await expectNoCriticalViolations(page);
  await page.getByRole("button", { name: /Switch language to ខ្មែរ/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("គ្រប់គ្រងម៉ឺនុយ");
  verifyConsole();
});
