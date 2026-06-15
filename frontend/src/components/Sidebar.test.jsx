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
    expect(screen.queryByRole("link", { name: "Products" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Categories" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "System Health" })).not.toBeInTheDocument();
  });
});
