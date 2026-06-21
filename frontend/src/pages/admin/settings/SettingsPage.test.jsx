import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../../i18n";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SettingsPage from "./SettingsPage";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "shop_owner" } }),
}));

const apiState = vi.hoisted(() => ({ shops: [{ id: 1, name: "QA Cafe" }] }));

vi.mock("../../../api/axios", () => ({
  default: {
    get: vi.fn((url) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: apiState.shops } } });
      }

      if (url === "/shops/1/branches") {
        return Promise.resolve({ data: { data: { branches: [{ id: 11, name: "Main Branch" }] } } });
      }

      if (url === "/shops/1/categories") {
        return Promise.resolve({ data: { data: { categories: [{ id: 21, name: "Coffee" }] } } });
      }

      if (url === "/shops/1/products") {
        return Promise.resolve({ data: { data: { products: [{ id: 31, name: "Latte" }] } } });
      }

      if (url === "/branches/11/tables") {
        return Promise.resolve({ data: { data: { tables: [{ id: 41, table_name: "A1" }] } } });
      }

      return Promise.resolve({
        data: {
          data: {
            shop: { id: 1, name: "QA Cafe", slug: "qa-cafe", phone: "+85510000001", address: "Phnom Penh", description: "Cafe", currency_code: "KHR", status: "active" },
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
    apiState.shops = [{ id: 1, name: "QA Cafe" }];
  });

  it("renders Telegram notification settings", async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <SettingsPage />
        </LanguageProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: "Shop Settings" })).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Shop profile" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Branding" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Operations & billing" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Payment settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Public QR menu" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Setup completion" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Brand preview" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Settings sections" })).toHaveClass("overflow-x-auto");
    expect(screen.getByLabelText("Shop name")).toBeInTheDocument();
    expect(screen.getByLabelText("Base currency")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Telegram notifications")).toBeInTheDocument());
    expect(screen.getByLabelText("Telegram chat ID")).toBeInTheDocument();
    expect(screen.getByText("Test Telegram")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Payments")).toBeInTheDocument();
    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("Public QR menu ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass("w-full", "sm:w-auto");
    expect(screen.getByRole("button", { name: "Save changes" })).toHaveClass("w-full", "sm:w-auto");
  });

  it("explains the shop prerequisite and links to the existing shops route", async () => {
    apiState.shops = [];

    render(
      <MemoryRouter initialEntries={["/admin/settings"]}>
        <LanguageProvider>
          <Routes>
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/shops" element={<p>Shops workspace</p>} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Create a shop before configuring settings")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Go to shops" }));
    expect(screen.getByText("Shops workspace")).toBeInTheDocument();
  });
});
