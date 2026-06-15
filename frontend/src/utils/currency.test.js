import { describe, expect, it } from "vitest";
import { formatCurrency, formatDualCurrency } from "./currency";

describe("currency formatting", () => {
  it("formats KHR and USD values", () => {
    expect(formatCurrency(12000, "KHR")).toBe("12,000 KHR");
    expect(formatCurrency(3.5, "USD")).toBe("$3.50");
  });

  it("formats dual-currency totals when secondary currency is available", () => {
    expect(formatDualCurrency(12000, "KHR", 3, "USD")).toBe("12,000 KHR / $3.00");
    expect(formatDualCurrency(12000, "KHR", null, null)).toBe("12,000 KHR");
  });
});
