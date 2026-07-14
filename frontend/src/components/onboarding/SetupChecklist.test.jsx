import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n";
import SetupChecklist from "./SetupChecklist";

describe("SetupChecklist", () => {
  afterEach(() => cleanup());

  it("renders server-derived setup progress and deep links", () => {
    renderChecklist(sampleOnboarding());

    expect(screen.getByRole("heading", { name: "Launch your QR ordering flow" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Confirm shop profile/i })).toHaveAttribute("href", "/admin/shops");
    expect(screen.getByRole("link", { name: /Add first product/i })).toHaveAttribute("href", "/admin/products");
    expect(screen.getByRole("link", { name: "Continue setup" })).toHaveAttribute("href", "/admin/onboarding");
    expect(screen.getByText("2/9")).toBeInTheDocument();
    expect(screen.getByText("Restaurant identity and address are configured.")).toBeInTheDocument();
  });

  it("shows persisted dismissal and resumes through the supplied action", () => {
    const resume = vi.fn();
    renderChecklist(sampleOnboarding({ status: { ...sampleStatus(), is_dismissed: true }, resume }));

    expect(screen.getByText("Setup guide hidden")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resume setup" }));
    expect(resume).toHaveBeenCalledTimes(1);
  });
});

function renderChecklist(onboarding) {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <SetupChecklist onboarding={onboarding} />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

function sampleOnboarding(overrides = {}) {
  return {
    status: sampleStatus(),
    loading: false,
    error: null,
    retry: vi.fn(),
    saving: false,
    dismiss: vi.fn(),
    resume: vi.fn(),
    ...overrides,
  };
}

function sampleStatus() {
  const keys = ["shop_profile", "branch", "category", "product", "table", "table_qr", "payment_instructions", "public_menu_preview", "workspace_ready"];
  const paths = ["/admin/shops", "/admin/branches", "/admin/categories", "/admin/products", "/admin/tables", "/admin/tables", "/admin/settings?section=payments", "/menu/cafe", "/admin/onboarding"];
  return {
    current_step: "category",
    completed_count: 2,
    total_steps: 9,
    progress_percent: 22,
    is_complete: false,
    is_dismissed: false,
    steps: keys.map((key, index) => ({ key, complete: index < 2, action_path: paths[index] })),
  };
}
