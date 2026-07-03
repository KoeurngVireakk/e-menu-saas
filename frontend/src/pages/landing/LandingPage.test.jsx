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

    expect(screen.getByRole("heading", { level: 1, name: /Run your restaurant from one QR ordering platform/i })).toBeInTheDocument();
    expect(screen.getByText(/Create QR menus, receive table orders/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Get started/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /View QR menu demo/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Sign in/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("Restaurant QR operations platform")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Product preview summary: restaurant QR operating system/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Features" })[0]).toHaveAttribute("href", "#features");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders how it works, feature bento, pricing, and FAQ sections", () => {
    renderLanding();

    expect(screen.getAllByRole("heading", { name: "Restaurant workflow from QR menu to reports" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("QR menu").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Customer order").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Reports").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Everything a QR ordering flow needs." }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("QR menu builder").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Simple planning packages for launch." }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("What is MenuDIGI?").length).toBeGreaterThan(0);
    expect(screen.getAllByText("How do customers order?").length).toBeGreaterThan(0);
  });

  it("renders the product preview and switches to Khmer", () => {
    renderLanding();

    expect(screen.getAllByText("MenuDIGI Demo Cafe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("MenuDIGI operations").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Table A01").length).toBeGreaterThan(0);
    expect(screen.getAllByText("QR table badge").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Payment proof + kitchen status").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Iced Latte").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3 items/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Recent order preview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Live service flow").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Payment proof workflow").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: /Switch language to ខ្មែរ/ })[0]);

    expect(localStorage.getItem("menudigi_language")).toBe("km");
    expect(screen.getByRole("heading", { level: 1, name: /គ្រប់គ្រងភោជនីយដ្ឋាន/ })).toBeInTheDocument();
    expect(screen.getAllByText("ប្រតិបត្តិការ MenuDIGI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("តុ A01").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ស្លាក QR តុ").length).toBeGreaterThan(0);
    expect(screen.getByText("លំហូរភោជនីយដ្ឋានពីម៉ឺនុយ QR ទៅរបាយការណ៍")).toBeInTheDocument();
  });
});
