import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "../../i18n";
import LanguageToggle from "./LanguageToggle";

describe("LanguageToggle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("switches language and saves the preference", () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch language to ខ្មែរ" }));

    expect(localStorage.getItem("menudigi_language")).toBe("km");
    expect(screen.getByRole("button", { name: "Switch language to ខ្មែរ" })).toHaveAttribute("aria-pressed", "true");
  });
});
