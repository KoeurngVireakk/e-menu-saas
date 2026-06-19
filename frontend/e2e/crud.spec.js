import { test, expect } from "@playwright/test";
import { mockAdmin } from "./helpers/routes.js";

test("products workspace loads as list-first CRUD", async ({ page }) => {
  await mockAdmin(page);
  await page.route("**/api/shops/1/products*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { products: [] } }) }));
  await page.route("**/api/shops/1/categories*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { categories: [] } }) }));
  await page.route("**/api/shops/1/branches*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { branches: [] } }) }));
  await page.goto("/admin/products");
  await expect(page.getByRole("main").getByRole("heading", { name: "Products", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Add product/i })).toBeVisible();
  await page.getByRole("button", { name: /Add product/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
