import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import api from "../../api/axios";
import { LanguageProvider } from "../../i18n";
import DemoEntryPage from "./DemoEntryPage";

const startDemo = vi.fn();

vi.mock("../../api/axios", () => ({
  default: { get: vi.fn() },
  getApiErrorMessage: (error, fallback) => error?.message || fallback,
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ startDemo }),
}));

describe("DemoEntryPage", () => {
  it("offers customer and admin demo paths without shared credentials", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          customer_path: "/menu/harbor-table-demo?branch=1&table=T01",
          admin_path: "/admin?tour=1",
          reset_interval_hours: 24,
        },
      },
    });
    startDemo.mockResolvedValueOnce({ admin_path: "/admin?tour=1" });

    render(
      <MemoryRouter initialEntries={["/demo"]}>
        <LanguageProvider>
          <Routes>
            <Route path="/demo" element={<DemoEntryPage />} />
            <Route path="/admin" element={<div>Admin demo opened</div>} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: /Explore MenuDIGI from both sides/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("link", { name: /Explore customer menu/i })).toHaveAttribute("href", "/menu/harbor-table-demo?branch=1&table=T01"));

    fireEvent.click(screen.getByRole("button", { name: /Explore admin dashboard/i }));

    await waitFor(() => expect(startDemo).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Admin demo opened")).toBeInTheDocument();
  });
});
