import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "../../i18n";
import SetupChecklist from "./SetupChecklist";

describe("SetupChecklist", () => {
  afterEach(() => cleanup());

  it("renders setup guidance with links to owner setup pages", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <SetupChecklist shops={[]} orders={[]} />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Launch your QR ordering flow" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create shop profile/i })).toHaveAttribute("href", "/admin/shops");
    expect(screen.getByRole("link", { name: /Add first product/i })).toHaveAttribute("href", "/admin/products");
    expect(screen.getByText("0/7")).toBeInTheDocument();
  });

  it("marks verifiable shop and order steps complete from loaded data", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <SetupChecklist shops={[{ id: 1 }]} orders={[{ id: 10 }]} />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("2/7")).toBeInTheDocument();
    expect(screen.getByText("Your restaurant identity is ready.")).toBeInTheDocument();
    expect(screen.getByText("A first order has reached the dashboard.")).toBeInTheDocument();
  });
});
