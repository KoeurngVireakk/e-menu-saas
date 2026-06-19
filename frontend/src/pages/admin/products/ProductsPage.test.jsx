import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import LanguageProvider from "../../../i18n/LanguageProvider";
import ProductsPage from "./ProductsPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "shop_owner" } }),
}));

describe("ProductsPage", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.delete.mockReset();
  });

  it("renders product filters and opens the tabbed add product modal", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "MenuDIGI Cafe" }] } } });
      }

      if (url === "/shops/1/products") {
        return Promise.resolve({
          data: {
            data: {
              products: [{ id: 20, name: "Iced Latte", price: 12000, status: "active", is_available: true, category: { name: "Coffee" } }],
            },
          },
        });
      }

      if (url === "/shops/1/categories") {
        return Promise.resolve({ data: { data: { categories: [{ id: 5, name: "Coffee" }] } } });
      }

      if (url === "/shops/1/branches") {
        return Promise.resolve({ data: { data: { branches: [{ id: 2, name: "Main" }] } } });
      }

      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });

    render(
      <MemoryRouter>
        <LanguageProvider>
          <ProductsPage />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByPlaceholderText("Search products...")).toBeInTheDocument();
    expect(await screen.findByText("Iced Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add product/i }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Add product" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Pricing" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Iced Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Options/Add-ons" }));
    expect(screen.getByRole("button", { name: "Copy example" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Options JSON"), { target: { value: "{}" } });
    fireEvent.click(screen.getByRole("button", { name: "Create product" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Options must be a JSON array.");
    expect(api.post).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add product" })).not.toBeInTheDocument());
  });
});
