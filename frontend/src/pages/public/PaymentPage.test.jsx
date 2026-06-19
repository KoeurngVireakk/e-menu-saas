import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PaymentPage from "./PaymentPage";

vi.mock("../../hooks/useOnlineStatus", () => ({
  default: () => true,
}));

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        data: {
          order: {
            order_number: "ORD-1",
            grand_total: "14500.00",
            currency_code: "KHR",
            shop: { currency_code: "KHR" },
            payment: null,
          },
          payment_methods: [
            { value: "cash", label: "Cash" },
            { value: "khqr_manual", label: "Manual KHQR" },
            { value: "bakong_khqr", label: "Bakong KHQR" },
          ],
        },
      },
    })),
  },
}));

describe("PaymentPage", () => {
  it("shows Bakong KHQR and does not show ABA payment options", async () => {
    render(
      <MemoryRouter initialEntries={["/payment/ORD-1"]}>
        <Routes>
          <Route path="/payment/:orderNumber" element={<PaymentPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: "Complete payment" })).toBeInTheDocument());
    expect(screen.getByText("Choose how you paid and submit proof only when the restaurant needs manual review.")).toBeInTheDocument();
    expect(screen.getByText("No provider secrets or raw gateway data are shown here.")).toBeInTheDocument();
    expect(screen.getByText("Bakong KHQR")).toBeInTheDocument();
    expect(screen.getByText("Manual KHQR")).toBeInTheDocument();
    expect(screen.queryByText(/ABA/i)).not.toBeInTheDocument();
  });
});
