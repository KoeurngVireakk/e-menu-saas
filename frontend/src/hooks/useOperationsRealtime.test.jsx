import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useOperationsRealtime from "./useOperationsRealtime";
import { getEcho } from "../lib/echo";

vi.mock("../lib/echo", () => ({
  getEcho: vi.fn(async () => null),
  getExistingEcho: vi.fn(() => null),
  isRealtimeConfigured: vi.fn(() => false),
}));

describe("useOperationsRealtime", () => {
  it("returns disconnected without loading realtime when disabled", () => {
    const { result } = renderHook(() => useOperationsRealtime({ enabled: false, restaurantId: 1 }));

    expect(result.current).toBe("disconnected");
    expect(getEcho).not.toHaveBeenCalled();
  });

  it("returns unavailable without loading realtime when not configured", async () => {
    const onUnavailable = vi.fn();
    const { result } = renderHook(() => useOperationsRealtime({ restaurantId: 1, onUnavailable }));

    expect(result.current).toBe("unavailable");
    await waitFor(() => expect(onUnavailable).toHaveBeenCalledTimes(1));
    expect(getEcho).not.toHaveBeenCalled();
  });
});
