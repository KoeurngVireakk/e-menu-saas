import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductDetailSheet from "./ProductDetailSheet";

describe("ProductDetailSheet", () => {
  it("stacks its mobile action and keeps it above the device safe area", () => {
    render(
      <ProductDetailSheet
        open
        locale="km"
        product={{
          id: 1,
          name: "កាហ្វេទឹកដោះគោ",
          description: "ភេសជ្ជៈកាហ្វេត្រជាក់",
          price: 5000,
          options: [],
        }}
        onClose={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    const addButton = screen.getByRole("button", { name: /បន្ថែមទៅកន្ត្រក/ });
    expect(addButton).toHaveClass("w-full", "sm:w-auto");
    expect(addButton.closest(".sticky")).toHaveClass("flex-col", "sm:flex-row", "pb-[max(1rem,env(safe-area-inset-bottom))]");
    expect(screen.getByRole("button", { name: "បន្ថយចំនួន" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "បន្ថែមចំនួន" })).toBeInTheDocument();
  });
});
