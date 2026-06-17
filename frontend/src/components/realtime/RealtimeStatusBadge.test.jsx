import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
