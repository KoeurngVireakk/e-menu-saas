import { describe, expect, it } from "vitest";
import { normalizeLocale, setPreferredLocale, t } from "./localization";

describe("localization", () => {
  it("returns translated labels for supported locales", () => {
    expect(t("km", "checkout")).toBe("ពិនិត្យការបញ្ជាទិញ");
    expect(t("en", "checkout")).toBe("Checkout");
  });

  it("falls back to English or the key for unsupported locales and missing keys", () => {
    expect(normalizeLocale("fr")).toBe("en");
    expect(t("fr", "checkout")).toBe("Checkout");
    expect(t("km", "missingKey")).toBe("missingKey");
  });

  it("stores only normalized preferred locales", () => {
    expect(setPreferredLocale("km")).toBe("km");
    expect(localStorage.getItem("emenu_locale")).toBe("km");
    expect(setPreferredLocale("fr")).toBe("en");
  });
});
