import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n";
import Navbar from "./Navbar";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { name: "Sokha Owner", email: "owner@example.com", role: "shop_owner" }, logout: vi.fn() }),
}));

describe("Navbar", () => {
  afterEach(() => cleanup());

  it("shows page context and a workspace search affordance", () => {
    render(
      <MemoryRouter initialEntries={["/admin/products"]}>
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument();
    expect(screen.getByText("Catalog work")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Jump to page or action" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account menu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open admin navigation" })).toBeInTheDocument();
    expect(screen.getByText("Sokha Owner")).toBeInTheDocument();
  });

  it("opens notification and profile menus", () => {
    render(
      <MemoryRouter initialEntries={["/admin/products"]}>
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Notification settings" })).toHaveAttribute("href", "/admin/settings");

    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getAllByRole("button", { name: /Switch language/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });
});
