import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductCard from "./ProductCard";

describe("ProductCard", () => {
  it("renders product details and add action", () => {
    const product = {
      id: 7,
      name: "Iced Latte",
      description: "Espresso and milk",
      price: 10000,
      discount_price: 8000,
      is_featured: true,
      is_available: true,
    };
    const onAdd = vi.fn();
    const onView = vi.fn();

    render(<ProductCard product={product} onAdd={onAdd} onView={onView} />);

    expect(screen.getByRole("button", { name: "Iced Latte" })).toBeInTheDocument();
    expect(screen.getByText("8,000 KHR")).toBeInTheDocument();
    expect(screen.getByText("10,000 KHR")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledWith(product);
  });
});
