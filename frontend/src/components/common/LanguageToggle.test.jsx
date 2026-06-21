import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "../../i18n";
import LanguageToggle from "./LanguageToggle";

describe("LanguageToggle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => cleanup());

  it("switches language and saves the preference", () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>,
    );

    const toggle = screen.getByRole("group", { name: "Language" });
    const khmerButton = screen.getByRole("button", { name: "Switch language to ខ្មែរ" });
    expect(toggle).toHaveClass("rounded-xl", "bg-slate-100");
    fireEvent.click(khmerButton);

    expect(localStorage.getItem("menudigi_language")).toBe("km");
    expect(screen.getByRole("button", { name: "Switch language to ខ្មែរ" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Switch language to ខ្មែរ" })).toHaveClass("khmer-button", "bg-white", "text-blue-700");
  });

  it("fills the available menu width in compact mode", () => {
    render(
      <LanguageProvider>
        <LanguageToggle compact className="w-full" />
      </LanguageProvider>,
    );

    expect(screen.getByRole("group", { name: "Language" })).toHaveClass("w-full", "max-w-full");
    expect(screen.getByRole("button", { name: "Switch language to English" })).toHaveClass("flex-1");
  });
});
