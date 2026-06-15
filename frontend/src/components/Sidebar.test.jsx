import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  it("shows owner-only navigation for shop owners", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Shops" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "System Health" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Payments" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Invoices" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Print Stations" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Staff" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Translations" })).toBeInTheDocument();
  });

  it("hides catalog and system health links from cashiers", () => {
    authState.user = { role: "cashier" };

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Orders" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Payments" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Invoices" })).toBeInTheDocument();
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

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Staff" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Translations" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Invoices" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Print Stations" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "System Health" })).not.toBeInTheDocument();
  });

  it("shows print stations but hides payment pages for waiters", () => {
    authState.user = { role: "waiter" };

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Orders" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Table QR" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Print Stations" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Payments" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Invoices" })).not.toBeInTheDocument();
  });
});
