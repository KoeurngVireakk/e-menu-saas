import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppCard from "./AppCard";

describe("AppCard", () => {
  it("labels titled panels and associates descriptions", () => {
    render(
      <AppCard title="Recent orders" description="Live orders appear here." labelled>
        <p>Order content</p>
      </AppCard>,
    );

    const panel = screen.getByRole("region", { name: "Recent orders" });
    expect(panel).toHaveAccessibleDescription("Live orders appear here.");
  });

  it("supports an explicit label for untitled panels", () => {
    render(
      <AppCard ariaLabel="Dashboard quick actions">
        <button type="button">Add product</button>
      </AppCard>,
    );

    expect(screen.getByRole("region", { name: "Dashboard quick actions" })).toBeInTheDocument();
  });
});
