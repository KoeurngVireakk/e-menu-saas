import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CreateEditDrawer from "./CreateEditDrawer";

describe("CreateEditDrawer", () => {
  it("renders an accessible dialog with a sticky save workflow", () => {
    render(
      <CreateEditDrawer open title="Create product" onClose={vi.fn()} onSubmit={vi.fn()} submitLabel="Save product">
        <label htmlFor="name">Name</label>
        <input id="name" />
      </CreateEditDrawer>,
    );

    expect(screen.getByRole("dialog", { name: "Create product" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save product" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });
});
