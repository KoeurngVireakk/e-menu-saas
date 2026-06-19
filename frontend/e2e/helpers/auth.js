import { expect } from "@playwright/test";
import { mockAuth } from "./routes.js";

export async function loginAsOwner(page) {
  await mockAuth(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill("e2e-owner@menudigi.test");
  await page.locator('input[type="password"]').fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
