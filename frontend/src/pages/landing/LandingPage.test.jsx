import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import LandingPage from "./LandingPage";

describe("LandingPage", () => {
  it("renders hero CTAs and navigation links", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /Digital menus, orders, and payments/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Get started/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Sign in/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Features" })[0]).toHaveAttribute("href", "#features");
  });

  it("renders features, pricing, how it works, and FAQ sections", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("heading", { name: "A complete operating layer for digital menus." }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Launch the flow in four steps." }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Simple plans for the rollout stage." }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("What is MenuDIGI?").length).toBeGreaterThan(0);
  });
});
