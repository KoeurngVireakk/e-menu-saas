import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReportsPage from "./ReportsPage";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, role: "shop_owner", name: "Owner" } }),
}));

vi.mock("../../../i18n", () => ({
  useLanguage: () => ({ t: (_key, fallback) => fallback }),
}));

vi.mock("../../../design-system/charts/SalesTrendChart", () => ({ default: () => <div>Sales chart</div> }));
vi.mock("../../../design-system/charts/OrderStatusBreakdownChart", () => ({ default: () => <div>Status chart</div> }));
vi.mock("../../../design-system/charts/TopProductsChart", () => ({ default: () => <div>Products chart</div> }));
vi.mock("../../../design-system/charts/PaymentMethodsChart", () => ({ default: () => <div>Payments chart</div> }));
vi.mock("../../../design-system/charts/HourlyActivityChart", () => ({ default: () => <div>Hourly chart</div> }));
vi.mock("../../../design-system/charts/BranchPerformanceTable", () => ({ default: () => <div>Branch table</div> }));

const analyticsPayload = {
  data: {
    data: {
      reports: {
        summary: {
          total_sales: 20000,
          order_count: 2,
          average_order_value: 10000,
          paid_amount: 20000,
          pending_payments: 1,
          pending_payment_amount: 12000,
          cancelled_orders: 0,
          completed_orders: 1,
          currency_code: "KHR",
        },
        sales_trend: [{ label: "Jun 19", sales: 20000, orders: 2 }],
        order_status: [{ label: "Completed", status: "completed", count: 1 }],
        top_products: [{ product_name: "Iced Latte", quantity_sold: 3, revenue: 20000 }],
        payment_methods: [{ method: "cash", label: "Cash", paid_total: 20000, pending_total: 0 }],
        branch_performance: [{ branch_id: 1, branch_name: "Main", sales: 20000, orders: 2 }],
        hourly_activity: [{ label: "12:00", orders: 2, sales: 20000 }],
      },
    },
  },
};

vi.mock("../../../api/axios", () => ({
  default: {
    get: vi.fn((url) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "Cafe", currency_code: "KHR" }] } } });
      }

      if (url === "/shops/1/branches") {
        return Promise.resolve({ data: { data: { branches: [{ id: 1, name: "Main" }] } } });
      }

      if (url === "/reports/analytics") {
        return Promise.resolve(analyticsPayload);
      }

      return Promise.reject(new Error(`Unexpected URL ${url}`));
    }),
  },
  getApiErrorMessage: () => "Unable to load reports.",
}));

describe("ReportsPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders filters, KPI cards, and chart sections", async () => {
    render(<ReportsPage />);

    expect(screen.getByText("Reports & Analytics")).toBeInTheDocument();
    expect(screen.getByLabelText("Shop")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("Total sales")).toBeInTheDocument());

    expect(screen.getAllByText("20,000 KHR").length).toBeGreaterThan(0);
    expect(screen.getByText("Sales trend")).toBeInTheDocument();
    expect(screen.getByText("Top products")).toBeInTheDocument();
    expect(await screen.findByText("Sales chart")).toBeInTheDocument();
  });

  it("clears optional filters", async () => {
    render(<ReportsPage />);

    await waitFor(() => expect(screen.getByText("Total sales")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Period"), { target: { value: "custom" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.getByLabelText("Period")).toHaveValue("last_7_days");
  });
});
