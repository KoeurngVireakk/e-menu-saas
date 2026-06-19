import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CrudFormModal from "./CrudFormModal";

describe("CrudFormModal", () => {
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
    await waitFor(() => expect(dialog).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: "Create product" }));
    expect(submit).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(close).toHaveBeenCalledOnce();
  });
});
