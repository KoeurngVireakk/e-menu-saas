import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StickyCartBar from "./StickyCartBar";

describe("StickyCartBar", () => {
  it("stays hidden for an empty cart", () => {
    render(<StickyCartBar cart={[]} onClick={vi.fn()} />);

    expect(screen.queryByRole("complementary", { name: "Cart summary" })).not.toBeInTheDocument();
  });

  it("shows item count, total, and action when cart has items", () => {
    const onClick = vi.fn();

    render(<StickyCartBar cart={[{ key: "1", quantity: 2, unit_price: 5000 }]} onClick={onClick} />);

    expect(screen.getByText("2 items")).toBeInTheDocument();
    expect(screen.getByText("10,000 KHR")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View cart" }));
    expect(onClick).toHaveBeenCalled();
  });
});
