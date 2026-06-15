import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import OrdersPage from "./OrdersPage";

vi.mock("../../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
  getApiErrorMessage: () => "Unable to load orders.",
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, role: "shop_owner" } }),
}));

describe("OrdersPage", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.put.mockReset();
  });

  it("renders operations filters and opens the order detail drawer", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          summary: { new_count: 1, pending_count: 1, today_revenue: 12000 },
          orders: [
            {
              id: 10,
              order_number: "ORD-100",
              order_status: "pending",
              payment_status: "unpaid",
              order_type: "dine_in",
              customer_name: "Sokha",
              customer_phone: "012345678",
              grand_total: 12000,
              currency_code: "KHR",
              created_at: "2026-06-16T08:00:00Z",
              branch: { id: 1, name: "Main Branch" },
              dining_table: { table_name: "Table 01" },
              items: [{ id: 1, quantity: 2, product_name: "Iced Latte", total_price: 12000, selected_options: [] }],
            },
          ],
        },
      },
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("ORD-100")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /All\s*1/ })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search order, table, customer, phone...")).toBeInTheDocument();
    expect(screen.getByLabelText("Branch")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment status")).toBeInTheDocument();
    expect(screen.getByLabelText("Order date")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View details" }));

    expect(screen.getByLabelText("Order ORD-100")).toBeInTheDocument();
    expect(screen.getByText("Order summary")).toBeInTheDocument();
    expect(screen.getByText("Update status")).toBeInTheDocument();
  });
});
