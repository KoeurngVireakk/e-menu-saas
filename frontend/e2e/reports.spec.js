import { test, expect } from "@playwright/test";
import { mockAdmin } from "./helpers/routes.js";

test("reports renders filters and safe empty analytics", async ({ page }) => {
  await mockAdmin(page);
  await page.route("**/api/shops/1/branches", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { branches: [{ id: 1, name: "Main E2E Branch" }] } }) }));
  await page.route("**/api/reports/analytics*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { reports: { summary: { total_sales: 0, order_count: 0, average_order_value: 0, paid_amount: 0, pending_payments: 0, pending_payment_amount: 0, cancelled_orders: 0, completed_orders: 0, currency_code: "KHR" }, sales_trend: [], order_status: [], top_products: [], payment_methods: [], branch_performance: [], hourly_activity: [] } } }) }));
  await page.goto("/admin/reports");
  await expect(page.getByRole("main").getByRole("heading", { name: "Reports & Analytics" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Period", exact: true })).toBeVisible();
  await expect(page.getByText("No report data for this period")).toBeVisible();
  await expect(page.getByText(/customer phone/i)).toHaveCount(0);
});
