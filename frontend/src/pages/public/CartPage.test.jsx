import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CartPage from "./CartPage";

let mockOnline = true;

vi.mock("../../hooks/useOnlineStatus", () => ({
  default: () => mockOnline,
}));

describe("CartPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockOnline = true;
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

  it("disables order submission while offline", () => {
    mockOnline = false;
    localStorage.setItem("emenu_cart", JSON.stringify([
      {
        key: "item-1",
        product_id: 1,
        name: "Iced Latte",
        quantity: 1,
        unit_price: 5000,
      },
    ]));

    render(
      <MemoryRouter initialEntries={["/cart?shop=1&branch=2&locale=en"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Connect to the internet before submitting your order.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Submit order/ }).some((button) => button.disabled)).toBe(true);
  });
});
