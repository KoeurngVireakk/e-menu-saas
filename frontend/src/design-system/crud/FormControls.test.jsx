import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Field, FileInput, TextInput, ToggleField } from "./FormControls";

describe("FormControls", () => {
  afterEach(() => cleanup());

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

  it("announces the selected upload and exposes toggle help", () => {
    const onFile = vi.fn();
    const onToggle = vi.fn();
    render(
      <>
        <Field label="Product image">
          <FileInput onChange={onFile} />
        </Field>
        <ToggleField label="Available" description="Customers can order this item." checked={false} onChange={onToggle} />
      </>,
    );

    const file = new File(["image"], "menu-item.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Product image"), { target: { files: [file] } });
    expect(onFile).toHaveBeenCalledWith(file);
    expect(screen.getByText("Selected file: menu-item.png")).toBeInTheDocument();

    const toggle = screen.getByRole("checkbox", { name: "Available" });
    expect(toggle).toHaveAccessibleDescription("Customers can order this item.");
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
