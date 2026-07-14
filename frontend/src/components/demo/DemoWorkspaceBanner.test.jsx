import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import api from "../../api/axios";
import { LanguageProvider } from "../../i18n";
import DemoWorkspaceBanner from "./DemoWorkspaceBanner";

vi.mock("../../api/axios", () => ({
  default: { get: vi.fn() },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { shops: [{ id: 1, name: "Harbor Table Demo", is_demo: true }] } }),
}));

describe("DemoWorkspaceBanner", () => {
  it("labels the read-only workspace and opens the owned guided tour", async () => {
    api.get.mockResolvedValue({ data: { data: { customer_path: "/menu/demo", reset_interval_hours: 24 } } });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <LanguageProvider>
          <DemoWorkspaceBanner />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Read-only demo workspace")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("link", { name: /View customer menu/i })).toHaveAttribute("href", "/menu/demo"));

    fireEvent.click(screen.getByRole("button", { name: /Start guided tour/i }));

    expect(screen.getByRole("dialog", { name: /Start with the operating picture/i })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 6")).toBeInTheDocument();
  });
});
