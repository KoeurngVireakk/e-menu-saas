import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import CashLedgerPage from "./CashLedgerPage";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "shop_owner" } }),
}));

vi.mock("../../../api/axios", () => ({
  default: {
    get: vi.fn((url) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "QA Cafe", currency_code: "KHR" }] } } });
      }

      if (url === "/shops/1/branches") {
        return Promise.resolve({ data: { data: { branches: [{ id: 2, name: "Main Branch" }] } } });
      }

      return Promise.resolve({
        data: {
          data: {
            entries: [],
            summary: { in_total: 10000, out_total: 2500, net_total: 7500, count: 2 },
          },
        },
      });
    }),
  },
  getApiErrorMessage: (_error, fallback) => fallback,
}));

describe("CashLedgerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ledger summary and export action for owners", async () => {
    render(<CashLedgerPage />);

    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/cash-ledger", expect.any(Object)));
    expect(screen.getByText("Cash in")).toBeInTheDocument();
    expect(screen.getByText("Cash out")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  });
});
