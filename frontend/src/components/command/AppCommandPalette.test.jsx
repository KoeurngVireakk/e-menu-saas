import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n";
import AppCommandPalette from "./AppCommandPalette";

describe("AppCommandPalette", () => {
  it("renders frontend navigation actions and filters them", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AppCommandPalette open onClose={vi.fn()} />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go to products/i })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Type a page or action..." }), { target: { value: "payment" } });

    expect(screen.getByRole("button", { name: /Go to payments/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Go to products/i })).not.toBeInTheDocument();
  });

  it("closes after selecting a command action", () => {
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <LanguageProvider>
          <AppCommandPalette open onClose={onClose} />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Go to orders/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
