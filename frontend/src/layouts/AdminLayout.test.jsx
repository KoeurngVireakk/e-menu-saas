import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
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
});
