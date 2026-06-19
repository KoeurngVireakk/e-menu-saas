import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../api/axios";
import { LanguageProvider } from "../../i18n";
import Dashboard from "./Dashboard";

vi.mock("../../api/axios", () => ({
  default: { get: vi.fn() },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { name: "Owner", role: "shop_owner" } }),
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

describe("Dashboard", () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  it("renders dashboard metrics and recent order", async () => {
    api.get
      .mockResolvedValueOnce({
        data: { data: { shops: [{ id: 1, name: "MenuDIGI Cafe", slug: "menudigi-cafe", status: "active" }] } },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            summary: { new_count: 1, pending_count: 1, today_revenue: 12000 },
            orders: [
              {
                id: 10,
                order_number: "ORD-1",
                branch: { name: "Main" },
                grand_total: 12000,
                currency_code: "KHR",
                order_status: "pending",
                payment_status: "unpaid",
                items: [{ product_name: "Latte", quantity: 2 }],
              },
            ],
          },
        },
      });

    render(
      <MemoryRouter>
        <LanguageProvider>
          <Dashboard />
        </LanguageProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/Welcome back, Owner/i)).toBeInTheDocument());
    expect(screen.getByText("Today sales")).toBeInTheDocument();
    expect(screen.getByText("ORD-1")).toBeInTheDocument();
    expect(screen.getByText("MenuDIGI Cafe")).toBeInTheDocument();
  });
});
