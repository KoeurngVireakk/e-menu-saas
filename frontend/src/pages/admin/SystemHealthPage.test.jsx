import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../api/axios";
import { LanguageProvider } from "../../i18n";
import SystemHealthPage from "./SystemHealthPage";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
  getApiErrorMessage: (error, fallback) => error?.userMessage || fallback,
}));

describe("SystemHealthPage", () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  it("renders health statuses from the API", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          health: {
            app: { status: "ok", environment: "testing", version: "1.0.0" },
            database: { status: "ok" },
            storage: { status: "ok", disk: "public", readable: true, writable: true },
            cache: { status: "ok", driver: "array" },
            queue: { status: "available", connection: "sync" },
            checked_at: "2026-06-15T00:00:00.000Z",
          },
        },
      },
    });

    render(
      <LanguageProvider>
        <SystemHealthPage />
      </LanguageProvider>,
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/system/health"));
    expect(screen.getByRole("heading", { name: "System Health" })).toBeInTheDocument();
    expect(screen.getByText("Database")).toBeInTheDocument();
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("Cache")).toBeInTheDocument();
    expect(screen.getByText("Queue")).toBeInTheDocument();
    expect(screen.getByText("testing")).toBeInTheDocument();
  });
});
