import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppBadge from "./AppBadge";
import AppStatusBadge from "./AppStatusBadge";

describe("AppBadge", () => {
  it("renders status variants", () => {
    render(
      <>
        <AppBadge status="success">Saved</AppBadge>
        <AppStatusBadge value="failed" />
      </>,
    );

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("failed")).toBeInTheDocument();
  });
});
