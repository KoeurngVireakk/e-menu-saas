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
    expect(screen.getByText("Review items and checkout")).toHaveClass("khmer-text");
    const action = screen.getByRole("button", { name: "View cart" });
    expect(action).toHaveClass("w-full", "sm:w-auto");
    expect(screen.getByRole("complementary", { name: "Cart summary" })).toHaveClass("pb-[calc(env(safe-area-inset-bottom)+0.75rem)]");
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalled();
  });
});
