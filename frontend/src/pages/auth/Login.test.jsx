import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n";
import Login from "./Login";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

describe("Login", () => {
  it("renders premium sign in form controls", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
  });
});
