import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState, LoadingState } from "./States";

describe("UI states", () => {
  it("renders loading text", () => {
    render(<LoadingState message="Loading orders..." />);

    expect(screen.getByText("Loading orders...")).toBeInTheDocument();
  });

  it("renders error text and retry action", () => {
    const retry = vi.fn();

    render(<ErrorState message="Orders failed." onRetry={retry} />);

    expect(screen.getByText("Orders failed.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
