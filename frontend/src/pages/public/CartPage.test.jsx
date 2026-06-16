import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CartPage from "./CartPage";

vi.mock("../../hooks/useOnlineStatus", () => ({
  default: () => true,
}));

describe("CartPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders cart items and checkout summary", () => {
    localStorage.setItem("emenu_cart", JSON.stringify([
      {
        key: "item-1",
        product_id: 1,
        name: "Iced Latte",
        quantity: 2,
        unit_price: 5000,
        selected_option_labels: ["Size: Large"],
      },
    ]));

    render(
      <MemoryRouter initialEntries={["/cart?shop=1&branch=2&locale=en"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Iced Latte")).toBeInTheDocument();
    expect(screen.getByText("Size: Large")).toBeInTheDocument();
    expect(screen.getAllByText("10,000 KHR").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Submit order/ })).toBeInTheDocument();
  });

  it("renders empty cart state", () => {
    render(
      <MemoryRouter initialEntries={["/cart?locale=en"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Cart is empty")).toBeInTheDocument();
    expect(screen.getByText("Return to the menu and choose a product.")).toBeInTheDocument();
  });
});
