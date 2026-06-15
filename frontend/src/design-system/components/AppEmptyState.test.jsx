import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppEmptyState from "./AppEmptyState";

describe("AppEmptyState", () => {
  it("renders empty-state copy", () => {
    render(<AppEmptyState title="No orders" description="Orders will appear here." />);

    expect(screen.getByText("No orders")).toBeInTheDocument();
    expect(screen.getByText("Orders will appear here.")).toBeInTheDocument();
  });
});
