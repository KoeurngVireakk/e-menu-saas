import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AppRoutes from "./AppRoutes";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

describe("AppRoutes", () => {
  it("renders the landing page at root", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: /Digital menus, orders, and payments/i })).toBeInTheDocument());
    expect(screen.getAllByRole("link", { name: /Get started/i }).length).toBeGreaterThan(0);
  });
});
