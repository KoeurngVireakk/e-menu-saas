import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../api/axios";
import MenuPage from "./MenuPage";

vi.mock("../../hooks/useOnlineStatus", () => ({
  default: () => true,
}));

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const menuResponse = {
  shop: { id: 1, name: "MenuDIGI Cafe", slug: "menudigi-cafe", status: "active", description: "Coffee and food" },
  branch: { id: 2, name: "Main Branch" },
  table: { table_code: "T01", table_name: "Table 01" },
  categories: [
    {
      id: 10,
      name: "Coffee",
      products: [
        {
          id: 100,
          name: "Iced Latte",
          description: "Espresso with milk",
          price: 10000,
          discount_price: 8000,
          is_available: true,
          is_featured: true,
          options: [],
        },
      ],
    },
  ],
};

describe("MenuPage", () => {
  beforeEach(() => {
    localStorage.clear();
    api.get.mockReset();
    api.get.mockResolvedValue({ data: { data: menuResponse } });
  });

  it("renders menu search/category/product and opens product detail sheet", async () => {
    render(
      <MemoryRouter initialEntries={["/menu/menudigi-cafe?locale=en"]}>
        <Routes>
          <Route path="/menu/:shopSlug" element={<MenuPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("MenuDIGI Cafe")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Coffee\s*1/ })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search menu")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Iced Latte" }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: "Add" })[0]);

    expect(screen.getByRole("dialog", { name: "Iced Latte" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(screen.getByRole("complementary", { name: "Cart summary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Checkout" })).toBeInTheDocument();
  });
});
