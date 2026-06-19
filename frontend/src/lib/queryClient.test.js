import { describe, expect, it } from "vitest";
import { queryClient } from "./queryClient";

describe("queryClient defaults", () => {
  it("keeps cached data briefly and avoids focus refetching", () => {
    const defaults = queryClient.getDefaultOptions().queries;

    expect(defaults.staleTime).toBe(30_000);
    expect(defaults.gcTime).toBe(5 * 60_000);
    expect(defaults.refetchOnWindowFocus).toBe(false);
    expect(defaults.refetchOnReconnect).toBe(true);
  });

  it("does not retry client validation or authorization failures", () => {
    const retry = queryClient.getDefaultOptions().queries.retry;

    expect(retry(0, { response: { status: 422 } })).toBe(false);
    expect(retry(0, { response: { status: 401 } })).toBe(false);
    expect(retry(0, { response: { status: 503 } })).toBe(true);
    expect(retry(1, { response: { status: 503 } })).toBe(false);
  });
});
