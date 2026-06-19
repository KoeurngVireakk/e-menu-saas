import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n";
import Navbar from "./Navbar";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

describe("Navbar", () => {
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
    expect(screen.getByRole("searchbox", { name: "Jump to page or action" })).toBeInTheDocument();
  });
});
