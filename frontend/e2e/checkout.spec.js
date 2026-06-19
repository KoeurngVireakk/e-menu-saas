import { test, expect } from "@playwright/test";
import { mockPublicMenu } from "./helpers/routes.js";

test("cart receives a configured menu item", async ({ page }) => {
  await mockPublicMenu(page);
  await page.goto("/menu/menudigi-e2e-cafe?branch=1&table=E01&locale=en");
  await page.getByRole("button", { name: "Add E2E Latte to cart" }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByText("E2E Latte", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Submit order/ })).toBeVisible();
});
