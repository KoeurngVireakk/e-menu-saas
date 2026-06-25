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

    expect(screen.getByRole("heading", { level: 1, name: /Turn every table into a digital ordering experience/i })).toBeInTheDocument();
    expect(screen.getByText(/Create QR menus, let customers order from their phones/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Get started/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /View QR menu demo/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Sign in/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("QR menu + table ordering + payment proof")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Features" })[0]).toHaveAttribute("href", "#features");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders how it works, feature bento, pricing, and FAQ sections", () => {
    renderLanding();

    expect(screen.getAllByRole("heading", { name: "How MenuDIGI works" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Build your digital menu").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Everything a QR ordering flow needs." }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("QR menu builder").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Simple planning packages for launch." }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("What is MenuDIGI?").length).toBeGreaterThan(0);
    expect(screen.getAllByText("How do customers order?").length).toBeGreaterThan(0);
  });

  it("renders the product preview and switches to Khmer", () => {
    renderLanding();

    expect(screen.getAllByText("MenuDIGI Demo Cafe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Table A01").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Iced Latte").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3 items/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Recent order preview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Proof review").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: /Switch language to ខ្មែរ/ })[0]);

    expect(localStorage.getItem("menudigi_language")).toBe("km");
    expect(screen.getByRole("heading", { level: 1, name: /បំលែងគ្រប់តុ/ })).toBeInTheDocument();
    expect(screen.getAllByText("តុ A01").length).toBeGreaterThan(0);
    expect(screen.getByText("របៀបដំណើរការ MenuDIGI")).toBeInTheDocument();
  });
});
