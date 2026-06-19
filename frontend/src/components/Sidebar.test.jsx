import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../i18n";
import Sidebar from "./Sidebar";

const authState = vi.hoisted(() => ({
  user: { role: "shop_owner" },
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: authState.user }),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    authState.user = { role: "shop_owner" };
  });

  afterEach(() => {
    cleanup();
  });

  const renderSidebar = () => render(
    <MemoryRouter>
      <LanguageProvider>
        <Sidebar />
      </LanguageProvider>
    </MemoryRouter>,
  );

  it("shows owner-only navigation for shop owners", () => {
    renderSidebar();

    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getByText("Operations")).toBeInTheDocument();
    expect(screen.getByText("Catalog")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getAllByText("Settings").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Shops" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "System Health" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Payments" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kitchen" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Invoices" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reports" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Daily Closing" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shifts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Expenses" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cash Ledger" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Print Stations" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Staff" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Translations" })).toBeInTheDocument();
  });

  it("hides catalog and system health links from cashiers", () => {
    authState.user = { role: "cashier" };

    renderSidebar();

    expect(screen.getByRole("link", { name: "Orders" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Payments" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kitchen" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Invoices" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kitchen" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reports" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Daily Closing" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shifts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Expenses" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cash Ledger" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Print Stations" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Products" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Categories" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Translations" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Staff" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "System Health" })).not.toBeInTheDocument();
  });

  it("shows staff and settings but not system health for managers", () => {
    authState.user = { role: "manager" };

    renderSidebar();

    expect(screen.getByRole("link", { name: "Staff" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Translations" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Invoices" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reports" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Daily Closing" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shifts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Expenses" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cash Ledger" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Print Stations" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "System Health" })).not.toBeInTheDocument();
  });

  it("shows print stations but hides payment pages for waiters", () => {
    authState.user = { role: "waiter" };

    renderSidebar();

    expect(screen.getByRole("link", { name: "Orders" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kitchen" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Table QR" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Print Stations" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Payments" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Invoices" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Reports" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Daily Closing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Shifts" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Expenses" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Cash Ledger" })).not.toBeInTheDocument();
  });
});
