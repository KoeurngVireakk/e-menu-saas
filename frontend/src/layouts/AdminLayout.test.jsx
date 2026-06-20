import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../i18n";
import AdminLayout from "./AdminLayout";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Outlet: () => <div>Admin content</div>,
  };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { name: "Owner", role: "shop_owner" }, logout: vi.fn() }),
}));

describe("AdminLayout", () => {
  afterEach(() => cleanup());

  it("renders protected admin layout content", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AdminLayout />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin content")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Go to dashboard").length).toBeGreaterThan(0);
  });

  it("opens the command palette with Ctrl+K", async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AdminLayout />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Go to orders/i })).toBeInTheDocument();
  });

  it("opens and closes the accessible mobile navigation", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AdminLayout />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open admin navigation" }));
    expect(screen.getAllByRole("button", { name: "Close admin navigation" }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: "Close admin navigation" })[0]);
    expect(screen.queryByRole("button", { name: "Close admin navigation" })).not.toBeInTheDocument();
  });
});
