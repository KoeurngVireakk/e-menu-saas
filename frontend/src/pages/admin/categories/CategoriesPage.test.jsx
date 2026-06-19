import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import { LanguageProvider } from "../../../i18n";
import CategoriesPage from "./CategoriesPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "shop_owner" } }),
}));

describe("CategoriesPage", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.delete.mockReset();
  });

  it("renders toolbar search and opens the add category modal", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "MenuDIGI Cafe" }] } } });
      }

      if (url === "/shops/1/categories") {
        return Promise.resolve({ data: { data: { categories: [{ id: 10, name: "Coffee", sort_order: 1, status: "active", branch: null }] } } });
      }

      if (url === "/shops/1/branches") {
        return Promise.resolve({ data: { data: { branches: [{ id: 2, name: "Main" }] } } });
      }

      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });

    render(
      <MemoryRouter>
        <LanguageProvider>
          <CategoriesPage />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByPlaceholderText("Search categories...")).toBeInTheDocument();
    expect(await screen.findByText("Coffee")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add category/i }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Add category" })).toBeInTheDocument());
    expect(screen.getByPlaceholderText("Coffee, Food, Desserts...")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add category" })).not.toBeInTheDocument());
  });
});
