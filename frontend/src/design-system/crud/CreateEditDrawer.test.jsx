import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CreateEditDrawer from "./CreateEditDrawer";

describe("CreateEditDrawer", () => {
  it("renders an accessible dialog with a sticky save workflow", () => {
    const submit = vi.fn((event) => event.preventDefault());

    render(
      <CreateEditDrawer
        open
        title="Create product"
        description="Add the customer-facing menu details."
        onClose={vi.fn()}
        onSubmit={submit}
        submitLabel="Save product"
      >
        <label htmlFor="name">Name</label>
        <input id="name" />
      </CreateEditDrawer>,
    );

    expect(screen.getByRole("dialog", { name: "Create product" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save product" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription("Add the customer-facing menu details.");

    fireEvent.click(screen.getByRole("button", { name: "Save product" }));
    expect(submit).toHaveBeenCalledOnce();
  });
});
