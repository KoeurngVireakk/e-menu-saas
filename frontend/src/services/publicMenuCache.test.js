import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPublicMenuCache,
  getPublicMenuCache,
  getPublicMenuCacheAge,
  publicMenuCacheKey,
  savePublicMenuCache,
} from "./publicMenuCache";

describe("public menu cache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keys menu cache by shop, locale, branch, and table context", () => {
    const tableOne = publicMenuCacheKey({ shopSlug: "cafe", locale: "en", branchId: 1, tableCode: "T01" });
    const tableTwo = publicMenuCacheKey({ shopSlug: "cafe", locale: "en", branchId: 1, tableCode: "T02" });

    expect(tableOne).not.toBe(tableTwo);
    expect(tableOne).toContain("cafe");
    expect(tableOne).toContain("en");
  });

  it("saves, reads, ages, and clears cached menu data safely", () => {
    const key = publicMenuCacheKey({ shopSlug: "cafe", locale: "km" });
    savePublicMenuCache(key, { shop: { name: "Cafe" }, categories: [] });

    expect(getPublicMenuCache(key).data.shop.name).toBe("Cafe");
    expect(getPublicMenuCacheAge(key)).toBeGreaterThanOrEqual(0);

    clearPublicMenuCache(key);
    expect(getPublicMenuCache(key)).toBeNull();
  });

  it("removes corrupted cache entries", () => {
    const key = publicMenuCacheKey({ shopSlug: "cafe" });
    localStorage.setItem(key, "{not-json");

    expect(getPublicMenuCache(key)).toBeNull();
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("strips sensitive fields before writing menu data to localStorage", () => {
    const key = publicMenuCacheKey({ shopSlug: "cafe" });
    savePublicMenuCache(key, {
      shop: { name: "Cafe", qr_token: "secret-token" },
      customer_phone: "+85510000004",
      payment: { provider_payment_id: "secret-provider-id" },
      categories: [{ products: [{ id: 1, name: "Latte", proof_image_path: "payments/proof.png" }] }],
    });

    const rawCache = localStorage.getItem(key);
    expect(rawCache).toContain("Latte");
    expect(rawCache).not.toContain("secret-token");
    expect(rawCache).not.toContain("+85510000004");
    expect(rawCache).not.toContain("secret-provider-id");
    expect(rawCache).not.toContain("proof.png");
  });
});
