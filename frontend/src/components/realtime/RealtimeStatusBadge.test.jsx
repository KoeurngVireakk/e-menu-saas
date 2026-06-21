import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageProvider, LANGUAGE_STORAGE_KEY } from "../../i18n";
import RealtimeStatusBadge from "./RealtimeStatusBadge";

describe("RealtimeStatusBadge", () => {
  afterEach(() => cleanup());

  it("renders production-friendly realtime status labels", () => {
    render(
      <div>
        <RealtimeStatusBadge status="connected" />
        <RealtimeStatusBadge status="connecting" />
        <RealtimeStatusBadge status="disconnected" />
        <RealtimeStatusBadge status="error" />
      </div>,
    );

    expect(screen.getByText("Live updates on")).toBeInTheDocument();
    expect(screen.getByText("Live updates on").closest("[role=status]")).toHaveAttribute("title", "Live operational updates are connected.");
    expect(screen.getByText("Reconnecting live updates...")).toBeInTheDocument();
    expect(screen.getByText("Live updates paused")).toBeInTheDocument();
    expect(screen.getByText("Realtime connection issue")).toBeInTheDocument();
  });

  it("uses Khmer realtime labels when Khmer is active", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "km");

    render(
      <LanguageProvider>
        <RealtimeStatusBadge status="connected" />
      </LanguageProvider>,
    );

    expect(screen.getByText("អាប់ដេតផ្ទាល់កំពុងដំណើរការ")).toBeInTheDocument();
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  });

  it("keeps compact shell status text available to assistive technology", () => {
    render(<RealtimeStatusBadge status="connected" compact />);

    expect(screen.getByRole("status")).toHaveClass("h-8", "px-2");
    expect(screen.getByText("Live updates on")).toHaveClass("sr-only");
  });
});
