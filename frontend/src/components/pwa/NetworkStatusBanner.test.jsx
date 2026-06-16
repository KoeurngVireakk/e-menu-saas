import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import NetworkStatusBanner from "./NetworkStatusBanner";

function setOnline(value) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
}

describe("NetworkStatusBanner", () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    setOnline(true);
  });

  it("shows an offline warning", () => {
    setOnline(false);

    render(<NetworkStatusBanner />);

    expect(screen.getByRole("status")).toHaveTextContent("You're offline");
  });

  it("briefly shows a back online message", () => {
    vi.useFakeTimers();
    setOnline(false);
    render(<NetworkStatusBanner />);

    setOnline(true);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.getAllByText("Back online.").length).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("Back online.")).not.toBeInTheDocument();
  });
});
