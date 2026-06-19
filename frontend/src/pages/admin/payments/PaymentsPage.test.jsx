import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import { LanguageProvider } from "../../../i18n";
import PaymentsPage from "./PaymentsPage";

vi.mock("../../../api/axios", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
  getApiErrorMessage: () => "Unable to load payments.",
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, role: "shop_owner" } }),
}));

describe("PaymentsPage", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.put.mockReset();
  });

  it("renders payment filters and opens the payment detail drawer", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          payments: [
            {
              id: 7,
              payment_method: "aba_payway",
              provider: "manual",
              provider_reference: "TXN-100",
              transaction_reference: "TXN-100",
              status: "pending",
              amount: 12000,
              currency_code: "KHR",
              created_at: "2026-06-16T08:15:00Z",
              logs: [],
              order: { order_number: "ORD-100", customer_name: "Sokha", customer_phone: "012345678" },
            },
          ],
        },
      },
    });

    render(
      <LanguageProvider>
        <PaymentsPage />
      </LanguageProvider>,
    );

    await waitFor(() => expect(screen.getByText("ORD-100")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /All\s*1/ })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search order, reference, customer...")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment method")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment date")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View details" }));

    expect(screen.getByLabelText("ORD-100")).toBeInTheDocument();
    expect(screen.getByText("Payment review")).toBeInTheDocument();
    expect(screen.getByText("Review action")).toBeInTheDocument();
  });
});
