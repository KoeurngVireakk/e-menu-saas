import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n";
import Register from "./Register";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ register: vi.fn() }),
}));

describe("Register", () => {
  it("renders premium registration controls", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Register />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });
});
