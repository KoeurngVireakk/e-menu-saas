import { test, expect } from "@playwright/test";
import { protectConsole } from "./helpers/console.js";
import { expectNoCriticalViolations } from "./helpers/accessibility.js";

test("landing conversion and language smoke", async ({ page }) => {
  const verifyConsole = protectConsole(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Digital menus");
  await expect(page.getByRole("link", { name: "Create your QR menu" })).toBeVisible();
  await expect(page.getByLabel("MenuDIGI mobile ordering preview")).toBeVisible();
  await expectNoCriticalViolations(page);
  await page.getByRole("button", { name: /Switch language to ខ្មែរ/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ម៉ឺនុយឌីជីថល");
  verifyConsole();
});
