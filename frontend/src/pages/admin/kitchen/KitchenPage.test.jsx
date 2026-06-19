import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KitchenOrderCard } from "./KitchenPage";

describe("KitchenOrderCard", () => {
  it("renders order items, notes, and selected options", () => {
    const order = {
      id: 1,
      order_number: "ORD-1",
      order_status: "pending",
      payment_status: "pending",
      order_type: "dine_in",
      elapsed_minutes: 4,
      branch: { name: "Main Branch" },
      dining_table: { table_name: "Table 01" },
      note: "No spicy sauce",
      items: [
        {
          id: 10,
          quantity: 2,
          product_name: "Iced Latte",
          note: "Less ice",
          kitchen_status: "pending",
          selected_options: [
            { name: "Size", values: [{ name: "Large" }] },
            { name: "Add-ons", values: [{ name: "Extra shot" }] },
          ],
        },
      ],
    };

    render(
      <KitchenOrderCard
        order={order}
        allowUpdate
        onOrderStatus={vi.fn()}
        onItemStatus={vi.fn()}
      />,
    );

    expect(screen.getByText("ORD-1")).toBeInTheDocument();
    expect(screen.getByText("2x Iced Latte")).toBeInTheDocument();
    expect(screen.getByText("No spicy sauce")).toBeInTheDocument();
    expect(screen.getByText("Less ice")).toBeInTheDocument();
    expect(screen.getByText("Size: Large")).toBeInTheDocument();
    expect(screen.getByText("Add-ons: Extra shot")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark unfinished items ready for order ORD-1" })).toBeInTheDocument();
  });
});
