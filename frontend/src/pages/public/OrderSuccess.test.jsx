import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../api/axios";
import OrderSuccess from "./OrderSuccess";

vi.mock("../../hooks/useOperationsRealtime", () => ({
  default: () => "disabled",
}));

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("OrderSuccess", () => {
  beforeEach(() => {
    localStorage.clear();
    api.get.mockReset();
    api.post.mockReset();
  });

  it("renders order number, status, payment, and timeline", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          order: {
            id: 1,
            order_number: "ORD-100",
            order_status: "preparing",
            payment_status: "unpaid",
            grand_total: 12000,
            currency_code: "KHR",
            shop: { name: "MenuDIGI Cafe", currency_code: "KHR" },
            branch: { name: "Main" },
            items: [],
          },
        },
      },
    });

    render(
      <MemoryRouter initialEntries={["/order-success/ORD-100?locale=en"]}>
        <Routes>
          <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getAllByText("ORD-100").length).toBeGreaterThan(0));
    expect(screen.getAllByText("preparing").length).toBeGreaterThan(0);
    expect(screen.getByText("Order status")).toBeInTheDocument();
    expect(screen.getByText("Payment status")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Continue to payment/ })).toBeInTheDocument();
    expect(screen.getByText("Feedback opens after completion")).toBeInTheDocument();
  });

  it("submits a review for a completed paid order", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          order: {
            id: 1,
            order_number: "ORD-PAID",
            order_status: "completed",
            payment_status: "paid",
            grand_total: 12000,
            currency_code: "KHR",
            shop: { name: "MenuDIGI Cafe", currency_code: "KHR" },
            branch: { name: "Main" },
            items: [],
            review: null,
          },
        },
      },
    });
    api.post.mockResolvedValue({
      data: { data: { review: { id: 5, rating: 5, comment: "Great service.", status: "visible" } } },
    });

    render(
      <MemoryRouter initialEntries={["/order-success/ORD-PAID?locale=en"]}>
        <Routes>
          <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("How was your order?")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Comment (optional)"), { target: { value: "Great service." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit review" }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/public/orders/ORD-PAID/review", { rating: 5, comment: "Great service." }));
    expect(screen.getByText("Thanks for your review")).toBeInTheDocument();
  });
});
