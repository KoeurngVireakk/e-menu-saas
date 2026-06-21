import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n";
import Navbar from "./Navbar";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { name: "Sokha Owner", email: "owner@example.com", role: "shop_owner" }, logout: vi.fn() }),
}));

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("../../api/axios", () => ({
  default: apiMock,
  getApiErrorMessage: (_error, fallback) => fallback,
}));

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    apiMock.get.mockResolvedValue({ data: { data: { count: 0, notifications: [] } } });
    apiMock.post.mockResolvedValue({ data: { data: { updated: 0 } } });
  });

  afterEach(() => cleanup());

  it("shows page context and a workspace search affordance", () => {
    render(
      <MemoryRouter initialEntries={["/admin/products"]}>
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Products" })).not.toBeInTheDocument();
    expect(screen.getByText("Catalog work")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Jump to page or action" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account menu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open admin navigation" })).toBeInTheDocument();
    expect(screen.getByText("Sokha Owner")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveClass("h-16", "min-w-0", "gap-2", "px-3");
    expect(screen.getAllByRole("button", { name: "Jump to page or action" }).find((button) => button.classList.contains("lg:flex"))).toHaveClass("max-w-md", "h-9");
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
    expect(screen.getByText("No notifications yet").closest(".absolute")).toHaveClass("w-[min(20rem,calc(100vw-1.5rem))]");
    expect(screen.getByRole("link", { name: "View all notifications" })).toHaveAttribute("href", "/admin/notifications");

    const accountTrigger = screen.getByRole("button", { name: "Account menu" });
    expect(accountTrigger).not.toHaveClass("ring-4", "border-blue-500");
    fireEvent.click(accountTrigger);
    expect(accountTrigger).toHaveAttribute("aria-expanded", "true");
    expect(accountTrigger).toHaveClass("border-slate-300", "bg-slate-100");
    expect(screen.getByRole("dialog", { name: "Account menu" })).toHaveClass("w-[min(21rem,calc(100vw-1rem))]");
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Switch language/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/admin/account/profile");
    expect(screen.getByRole("link", { name: "Shop Settings" })).toHaveAttribute("href", "/admin/settings");
    expect(screen.getByRole("link", { name: "System Health" })).toHaveAttribute("href", "/admin/system-health");
    expect(screen.getByRole("link", { name: "Notifications" })).toHaveAttribute("href", "/admin/notifications");
  });

  it("shows real unread notification count when authenticated", async () => {
    localStorage.setItem("emenu_token", "token");
    apiMock.get.mockImplementation((url) => {
      if (url === "/notifications/unread-count") {
        return Promise.resolve({ data: { data: { count: 3 } } });
      }

      return Promise.resolve({
        data: {
          data: {
            notifications: [
              { id: 1, title: "New order", body: "New order: ORD-1", read_at: null },
            ],
          },
        },
      });
    });

    render(
      <MemoryRouter initialEntries={["/admin/products"]}>
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    await waitFor(() => expect(screen.getByText("New order")).toBeInTheDocument());
  });
});
