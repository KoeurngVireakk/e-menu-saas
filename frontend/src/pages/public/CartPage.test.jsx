import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CartPage from "./CartPage";
import api from "../../api/axios";

let mockOnline = true;

vi.mock("../../hooks/useOnlineStatus", () => ({
  default: () => mockOnline,
}));

vi.mock("../../api/axios", () => ({
  default: { post: vi.fn() },
}));

describe("CartPage", () => {
  afterEach(() => cleanup());

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
    const submit = screen.getByRole("button", { name: /Submit order/ });
    expect(submit).toHaveClass("w-full", "sm:w-auto");
    expect(submit.closest(".sticky")).toHaveClass("bottom-0", "pb-[max(0.75rem,env(safe-area-inset-bottom))]");
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

  it("routes simulated demo checkout to the safe preview instead of a real order page", async () => {
    localStorage.setItem("emenu_cart", JSON.stringify([{
      key: "demo-item",
      product_id: 7,
      name: "Jasmine cold brew tea",
      quantity: 1,
      unit_price: 9000,
    }]));
    api.post.mockResolvedValueOnce({ data: { data: {
      simulated: true,
      message: "No data was stored.",
      order: { order_number: "DEMO-PREVIEW", grand_total: 9000 },
    } } });

    render(
      <MemoryRouter initialEntries={["/cart?shop=1&branch=2&locale=en"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/demo/order-status" element={<div>Safe demo preview</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Submit order/ }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/public/orders", expect.objectContaining({ shop_id: "1", branch_id: "2" })));
    expect(await screen.findByText("Safe demo preview")).toBeInTheDocument();
  });
});
