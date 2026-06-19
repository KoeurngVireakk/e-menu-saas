import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageProvider, LANGUAGE_STORAGE_KEY } from "../../i18n";
import RealtimeStatusBadge from "./RealtimeStatusBadge";

describe("RealtimeStatusBadge", () => {
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
    expect(screen.getByText("Connecting live updates...")).toBeInTheDocument();
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
});
