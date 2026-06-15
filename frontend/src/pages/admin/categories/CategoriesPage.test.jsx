import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
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

  it("renders toolbar search and opens the add category drawer", async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: { shops: [{ id: 1, name: "MenuDIGI Cafe" }] } } })
      .mockResolvedValueOnce({ data: { data: { categories: [{ id: 10, name: "Coffee", sort_order: 1, status: "active", branch: null }] } } })
      .mockResolvedValueOnce({ data: { data: { branches: [{ id: 2, name: "Main" }] } } });

    render(
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByPlaceholderText("Search categories...")).toBeInTheDocument();
    expect(await screen.findByText("Coffee")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add category/i }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Add category" })).toBeInTheDocument());
    expect(screen.getByPlaceholderText("Coffee, Food, Desserts...")).toBeInTheDocument();
  });
});
