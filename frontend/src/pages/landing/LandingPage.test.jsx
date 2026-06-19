import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "../../i18n";
import LandingPage from "./LandingPage";

function renderLanding() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <LandingPage />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe("LandingPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders hero CTAs and navigation links", () => {
    renderLanding();

    expect(screen.getByRole("heading", { name: /Digital menus, orders, and payments/i })).toBeInTheDocument();
    expect(screen.getByText(/For restaurant owners, cashiers, waiters/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Get started/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /View QR menu demo/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Sign in/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Features" })[0]).toHaveAttribute("href", "#features");
  });

  it("renders features, pricing, how it works, and FAQ sections", () => {
    renderLanding();

    expect(screen.getAllByRole("heading", { name: "A complete operating layer for digital menus." }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Launch the flow in four steps." }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Simple plans for the rollout stage." }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("What is MenuDIGI?").length).toBeGreaterThan(0);
  });

  it("renders the phone mockup summary and switches to Khmer", () => {
    renderLanding();

    expect(screen.getAllByText("MenuDIGI Demo Cafe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Table A01").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3 items/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: /Switch language to ខ្មែរ/ })[0]);

    expect(localStorage.getItem("menudigi_language")).toBe("km");
    expect(screen.getByRole("heading", { level: 1, name: /ម៉ឺនុយឌីជីថល/ })).toBeInTheDocument();
    expect(screen.getAllByText("តុ A01").length).toBeGreaterThan(0);
  });
});
