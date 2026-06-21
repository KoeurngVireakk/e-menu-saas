import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../api/axios";
import { LANGUAGE_STORAGE_KEY, LanguageProvider } from "../../i18n";
import Dashboard from "./Dashboard";

vi.mock("../../api/axios", () => ({
  default: { get: vi.fn() },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ authenticated: true, user: { name: "Owner", role: "shop_owner" } }),
}));

vi.mock("../../hooks/useOperationsRealtime", () => ({
  default: () => "connected",
}));

vi.mock("../../design-system/charts/OrderStatusChart", () => ({
  default: () => <div data-testid="order-status-chart" />,
}));

vi.mock("../../design-system/charts/SalesLineChart", () => ({
  default: () => <div data-testid="sales-line-chart" />,
}));

vi.mock("../../design-system/charts/TopProductsChart", () => ({
  default: () => <div data-testid="top-products-chart" />,
}));

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LanguageProvider>
          <Dashboard />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockApi({ orders = sampleOrders(), shops = sampleShops() } = {}) {
  api.get.mockImplementation((url) => {
    if (url === "/shops") {
      return Promise.resolve({ data: { data: { shops } } });
    }

    if (url === "/orders") {
      return Promise.resolve({
        data: {
          data: {
            summary: { new_count: 1, pending_count: orders.filter((order) => order.order_status !== "completed").length, today_revenue: 12000 },
            orders,
          },
        },
      });
    }

    return Promise.reject(new Error(`Unexpected URL ${url}`));
  });
}

describe("Dashboard", () => {
  beforeEach(() => {
    api.get.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the premium overview heading, KPI cards, reports link, and one h1", async () => {
    mockApi();

    renderDashboard();

    await waitFor(() => expect(screen.getByRole("heading", { name: "Today’s Operations", level: 1 })).toBeInTheDocument());
    expect(screen.getByText("Track sales, orders, payments, and kitchen activity in one place.")).toBeInTheDocument();
    expect(screen.getByText("Today’s Sales")).toBeInTheDocument();
    expect(screen.getByText("Average Order Value")).toBeInTheDocument();
    expect(screen.getByText("Kitchen Queue")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /View reports/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders needs-attention action items and recent operation panels from real order data", async () => {
    mockApi();

    renderDashboard();

    await waitFor(() => expect(screen.getAllByText("ORD-1").length).toBeGreaterThan(0));
    expect(screen.getByRole("heading", { name: "Needs attention" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /payment needs review/i })).toHaveAttribute("href", "/admin/payments");
    expect(screen.getByRole("heading", { name: "Recent orders" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pending payments" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kitchen queue" })).toBeInTheDocument();
  });

  it("renders permission-aware quick actions with valid admin links", async () => {
    mockApi();

    renderDashboard();

    await waitFor(() => expect(screen.getAllByRole("heading", { name: "Quick actions" }).length).toBeGreaterThan(0));
    expect(screen.getByRole("link", { name: /Add product/i })).toHaveAttribute("href", "/admin/products");
    expect(screen.getByRole("link", { name: /Create QR table/i })).toHaveAttribute("href", "/admin/tables");
    expect(screen.getAllByRole("link", { name: /Open kitchen/i }).some((link) => link.getAttribute("href") === "/admin/kitchen")).toBe(true);
    expect(screen.getByRole("link", { name: /Shop settings/i })).toHaveAttribute("href", "/admin/settings");
  });

  it("renders the recent orders empty state when no orders exist", async () => {
    mockApi({ orders: [] });

    renderDashboard();

    await waitFor(() => expect(screen.getByText("No orders yet")).toBeInTheDocument());
    expect(screen.getByText("Orders will appear here when customers scan table QR codes and submit their cart.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /No customer orders yet/i })).toHaveAttribute("href", "/admin/tables");
  });

  it("shows a refreshing overview status during manual refetch while keeping existing data visible", async () => {
    let refetchOrdersResolve;
    let orderCalls = 0;

    api.get.mockImplementation((url) => {
      if (url === "/shops") return Promise.resolve({ data: { data: { shops: sampleShops() } } });
      if (url === "/orders") {
        orderCalls += 1;
        if (orderCalls === 1) {
          return Promise.resolve({
            data: { data: { summary: { new_count: 1, pending_count: 1, today_revenue: 12000 }, orders: sampleOrders() } },
          });
        }
        return new Promise((resolve) => {
          refetchOrdersResolve = () => resolve({
            data: { data: { summary: { new_count: 1, pending_count: 1, today_revenue: 12000 }, orders: sampleOrders() } },
          });
        });
      }
      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });

    renderDashboard();

    await waitFor(() => expect(screen.getAllByText("ORD-1").length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: /Refresh/i }));
    expect((await screen.findAllByText("Refreshing overview...")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("ORD-1").length).toBeGreaterThan(0);
    refetchOrdersResolve();
  });

  it("renders Khmer overview title and subtitle", async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "km");
    mockApi();

    renderDashboard();

    await waitFor(() => expect(screen.getByRole("heading", { name: "ប្រតិបត្តិការថ្ងៃនេះ", level: 1 })).toBeInTheDocument());
    expect(screen.getByText("មើលការលក់ ការកុម្ម៉ង់ ការទូទាត់ និងសកម្មភាពផ្ទះបាយនៅកន្លែងតែមួយ។")).toBeInTheDocument();
  });
});

function sampleShops() {
  return [{ id: 1, name: "MenuDIGI Cafe", slug: "menudigi-cafe", status: "active" }];
}

function sampleOrders() {
  return [
    {
      id: 10,
      order_number: "ORD-1",
      branch: { name: "Main" },
      grand_total: 12000,
      currency_code: "KHR",
      order_status: "pending",
      payment_status: "unpaid",
      created_at: "2026-06-21T08:00:00.000Z",
      items: [{ product_name: "Latte", quantity: 2 }],
    },
  ];
}
