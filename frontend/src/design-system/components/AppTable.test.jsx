import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppTable from "./AppTable";

const columns = [{ accessorKey: "name", header: "Product" }];

describe("AppTable", () => {
  it("renders an unframed empty state with a next action", () => {
    const create = vi.fn();
    render(
      <AppTable
        columns={columns}
        emptyTitle="No products"
        emptyDescription="Add a product to publish it on the QR menu."
        emptyActionLabel="Add product"
        onEmptyAction={create}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add product" }));
    expect(create).toHaveBeenCalledOnce();
  });

  it("exposes sortable table headers", () => {
    render(<AppTable columns={columns} data={[{ name: "Latte" }]} ariaLabel="Products" />);

    expect(screen.getByRole("table", { name: "Products" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Products scrollable region" })).toHaveClass("max-w-full", "overflow-x-auto", "overscroll-x-contain");
    expect(screen.getByRole("columnheader", { name: "Product" })).toHaveAttribute("aria-sort", "none");
  });
});
