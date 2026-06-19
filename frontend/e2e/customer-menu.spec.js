import { test, expect } from "@playwright/test";
import { mockPublicMenu } from "./helpers/routes.js";

test("customer menu opens product and cart", async ({ page }) => {
  await mockPublicMenu(page);
  await page.goto("/menu/menudigi-e2e-cafe?branch=1&table=E01&locale=en");
  await expect(page.getByRole("heading", { name: "MenuDIGI E2E Cafe" })).toBeVisible();
  await page.getByRole("button", { name: "Add E2E Latte to cart" }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("complementary", { name: "Cart summary" })).toBeVisible();
});
