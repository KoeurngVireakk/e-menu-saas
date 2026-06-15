import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SettingsPage from "./SettingsPage";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "shop_owner" } }),
}));

vi.mock("../../../api/axios", () => ({
  default: {
    get: vi.fn((url) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "QA Cafe" }] } } });
      }

      return Promise.resolve({
        data: {
          data: {
            shop: { id: 1, name: "QA Cafe", currency_code: "KHR" },
            settings: {
              telegram_enabled: true,
              telegram_chat_id: "123456",
              telegram_order_notifications: true,
              telegram_payment_notifications: true,
              telegram_invoice_notifications: false,
            },
          },
        },
      });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: { notification: { status: "sent" } } } })),
  },
  getApiErrorMessage: (_error, fallback) => fallback,
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Telegram notification settings", async () => {
    render(<SettingsPage />);

    await waitFor(() => expect(screen.getByText("Telegram notifications")).toBeInTheDocument());
    expect(screen.getByLabelText("Telegram chat ID")).toBeInTheDocument();
    expect(screen.getByText("Test Telegram")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Payments")).toBeInTheDocument();
    expect(screen.getByText("Invoices")).toBeInTheDocument();
  });
});
