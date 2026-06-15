import { describe, expect, it } from "vitest";
import { menuCacheKey } from "./menuCache";

describe("menuCacheKey", () => {
  it("includes the selected locale to keep offline menu caches separate", () => {
    expect(menuCacheKey("qa-cafe", "branch=1&locale=en", "en"))
      .not.toBe(menuCacheKey("qa-cafe", "branch=1&locale=km", "km"));
    expect(menuCacheKey("qa-cafe", "branch=1", "km")).toContain(":km:");
  });
});
