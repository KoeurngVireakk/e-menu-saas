import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

function BrokenComponent() {
  throw new Error("Render failed");
}

describe("ErrorBoundary", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("renders a safe fallback when a child throws", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: /MenuDIGI could not load this screen/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go back/i })).toBeInTheDocument();
    expect(screen.queryByText(/render failed/i)).not.toBeInTheDocument();
  });
});
