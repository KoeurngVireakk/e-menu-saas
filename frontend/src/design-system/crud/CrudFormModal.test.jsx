import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CrudFormModal from "./CrudFormModal";

describe("CrudFormModal", () => {
  afterEach(() => cleanup());

  it("renders an accessible centered form dialog and closes from cancel", async () => {
    const close = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());

    render(
      <CrudFormModal
        open
        title="Add product"
        description="Create a customer-facing menu item."
        onClose={close}
        onSubmit={submit}
        submitLabel="Create product"
      >
        <label htmlFor="name">Name</label>
        <input id="name" />
      </CrudFormModal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Add product" });
    expect(dialog).toHaveAccessibleDescription("Create a customer-facing menu item.");
    expect(dialog).toHaveClass("max-h-[calc(100dvh-1rem)]", "min-w-0", "overflow-hidden");
    expect(screen.getByRole("button", { name: "Create product" }).closest("footer")).toHaveClass("pb-[max(1rem,env(safe-area-inset-bottom))]");
    await waitFor(() => expect(dialog).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: "Create product" }));
    expect(submit).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(close).toHaveBeenCalledOnce();
  });

  it("does not dismiss a form with Escape while a save is in progress", () => {
    const close = vi.fn();

    render(
      <CrudFormModal open title="Saving product" onClose={close} onSubmit={vi.fn()} loading>
        <input aria-label="Name" />
      </CrudFormModal>,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
  });
});
