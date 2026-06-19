import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field, TextInput } from "./FormControls";

describe("FormControls", () => {
  it("associates helper and validation copy with its field", () => {
    render(
      <Field
        label="Product name"
        description="Shown on the customer QR menu."
        error="Enter a product name."
        required
      >
        <TextInput value="" onChange={vi.fn()} />
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: "Product name" });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Shown on the customer QR menu. Enter a product name.");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a product name.");
  });
});
