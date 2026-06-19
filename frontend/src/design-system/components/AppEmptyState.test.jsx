import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppEmptyState from "./AppEmptyState";

describe("AppEmptyState", () => {
  it("renders empty-state copy", () => {
    render(<AppEmptyState title="No orders" description="Orders will appear here." />);

    expect(screen.getByText("No orders")).toBeInTheDocument();
    expect(screen.getByText("Orders will appear here.")).toBeInTheDocument();
  });

  it("renders next actions and practical checklist items", () => {
    const primary = vi.fn();
    const secondary = vi.fn();

    render(
      <AppEmptyState
        title="Add your first product"
        description="Products appear on your QR menu."
        actionLabel="Add product"
        onAction={primary}
        secondaryActionLabel="View QR tables"
        onSecondaryAction={secondary}
        checklist={["Create a category", "Add product price"]}
      />,
    );

    expect(screen.getByText("Create a category")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add product" }));
    fireEvent.click(screen.getByRole("button", { name: "View QR tables" }));
    expect(primary).toHaveBeenCalled();
    expect(secondary).toHaveBeenCalled();
  });
});
