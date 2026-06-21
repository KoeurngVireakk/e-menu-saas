import { menu, owner } from "./testData.js";

const json = (data, message = "OK") => ({ status: 200, contentType: "application/json", body: JSON.stringify({ message, data }) });

export async function mockAuth(page) {
  await page.route("**/api/auth/login", (route) => route.fulfill(json({ token: "e2e-token", user: owner }, "Signed in")));
  await page.route("**/api/auth/me", (route) => route.fulfill(json({ user: owner })));
  await page.route("**/api/auth/logout", (route) => route.fulfill(json({})));
}

export async function mockPublicMenu(page) {
  await page.route("**/api/public/shops/*/menu*", (route) => route.fulfill(json(menu)));
}

export async function mockAdmin(page) {
  await mockAuth(page);
  await page.addInitScript(() => localStorage.setItem("emenu_token", "e2e-token"));
  await page.route("**/api/shops", (route) => route.fulfill(json({ shops: [menu.shop] })));
  await page.route("**/api/orders*", (route) => route.fulfill(json({ orders: [], summary: { new_count: 0, pending_count: 0, today_revenue: 0 } })));
}

export async function mockAdminSettings(page) {
  await mockAdmin(page);
  await page.route("**/api/shops/1/settings", (route) => route.fulfill(json({
    shop: menu.shop,
    settings: {
      base_currency: "KHR",
      secondary_currency: "USD",
      exchange_rate: 4100,
      order_auto_accept: false,
      telegram_enabled: false,
    },
  })));
}
