import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState, ForbiddenState, LoadingState, NoResultsState, OfflineState, SuccessState } from "./States";

describe("UI states", () => {
  it("renders loading text", () => {
    render(<LoadingState message="Loading orders..." />);

    expect(screen.getByText("Loading orders...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders error text and retry action", () => {
    const retry = vi.fn();

    render(<ErrorState message="Orders failed." onRetry={retry} />);

    expect(screen.getByText("Orders failed.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("renders practical empty variants", () => {
    render(
      <div>
        <NoResultsState />
        <OfflineState />
        <ForbiddenState checklist={["Ask an owner for access"]} />
        <SuccessState />
      </div>,
    );

    expect(screen.getByText("No matching results")).toBeInTheDocument();
    expect(screen.getByText("You are offline")).toBeInTheDocument();
    expect(screen.getByText("Access unavailable")).toBeInTheDocument();
    expect(screen.getByText("Ask an owner for access")).toBeInTheDocument();
    expect(screen.getByText("All set")).toBeInTheDocument();
  });
});
