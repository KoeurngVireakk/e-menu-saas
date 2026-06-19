import { test, expect } from "@playwright/test";

test("payment page exposes safe payment controls", async ({ page }) => {
  await page.route("**/api/public/orders/E2E-ORDER", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: { order: { order_number: "E2E-ORDER", grand_total: 10000, currency_code: "KHR", payment_status: "unpaid", payment: null }, payment_methods: [{ value: "cash", label: "Cash" }, { value: "khqr_manual", label: "Manual KHQR" }] } }),
  }));
  await page.goto("/payment/E2E-ORDER?locale=en");
  await expect(page.getByRole("heading", { name: "Complete payment" })).toBeVisible();
  await expect(page.getByLabel("Payment method")).toBeVisible();
  await expect(page.getByText(/provider secrets/i)).toBeVisible();
  await expect(page.getByText(/api key|secret key/i)).toHaveCount(0);
});
