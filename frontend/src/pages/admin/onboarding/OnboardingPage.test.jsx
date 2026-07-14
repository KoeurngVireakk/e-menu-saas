import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../../i18n";
import useOnboarding from "../../../hooks/useOnboarding";
import OnboardingPage from "./OnboardingPage";

vi.mock("../../../hooks/useOnboarding", () => ({ default: vi.fn() }));

describe("OnboardingPage", () => {
  afterEach(() => cleanup());

  it("renders real progress, the current primary action, and final QR/menu actions", () => {
    useOnboarding.mockReturnValue({
      status: completeStatus(),
      loading: false,
      error: null,
      retry: vi.fn(),
      saving: false,
      mutationError: null,
      completeStep: vi.fn(),
      dismiss: vi.fn(),
      resume: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LanguageProvider><OnboardingPage /></LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Guided restaurant setup" })).toBeInTheDocument();
    expect(screen.getByText("9/9 · 100%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Preview your menu" })).toHaveAttribute("href", "/menu/configured-cafe?branch=1&table=T01");
    expect(screen.getByRole("link", { name: "Download or print QR" })).toHaveAttribute("href", "/admin/tables");
  });
});

function completeStatus() {
  const keys = ["shop_profile", "branch", "category", "product", "table", "table_qr", "payment_instructions", "public_menu_preview", "workspace_ready"];
  return {
    shop: { id: 1, name: "Configured Cafe", slug: "configured-cafe" },
    current_step: "workspace_ready",
    next_step: null,
    completed_steps: keys,
    completed_count: 9,
    total_steps: 9,
    progress_percent: 100,
    is_complete: true,
    is_dismissed: false,
    steps: keys.map((key) => ({ key, complete: true, action_path: "/admin/onboarding" })),
    preview_path: "/menu/configured-cafe?branch=1&table=T01",
    qr_action_path: "/admin/tables",
  };
}
