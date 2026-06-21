import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../../i18n";
import ProfilePage from "./ProfilePage";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock("../../../api/axios", () => ({
  default: apiMock,
  getApiErrorMessage: (_error, fallback) => fallback,
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LanguageProvider>
          <ProfilePage />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMock.get.mockResolvedValue({
      data: {
        data: {
          profile: {
            id: 1,
            name: "Sokha Owner",
            email: "owner@example.com",
            phone: "+85510000001",
            role: "shop_owner",
            status: "active",
            created_at: "2026-06-01T00:00:00.000000Z",
            preferences: {
              language: "en",
              timezone: "Asia/Phnom_Penh",
              date_format: "yyyy-mm-dd",
              dashboard_default_range: "today",
              notifications: { orders: true, payments: true, system: true },
            },
          },
        },
      },
    });
    apiMock.put.mockImplementation((url, payload) => {
      if (url === "/account/profile") {
        return Promise.resolve({
          data: {
            data: {
              profile: {
                id: 1,
                name: payload.name,
                email: "owner@example.com",
                phone: payload.phone,
                role: "shop_owner",
                status: "active",
                preferences: {},
              },
            },
          },
        });
      }

      if (url === "/account/preferences") {
        return Promise.resolve({ data: { data: { preferences: payload } } });
      }

      return Promise.resolve({ data: { success: true } });
    });
  });

  it("renders profile sections and submits personal information", async () => {
    renderPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Personal information" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Security" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Preferences" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Updated Owner" } });
    fireEvent.click(screen.getByRole("button", { name: "Save personal information" }));

    await waitFor(() => expect(apiMock.put).toHaveBeenCalledWith("/account/profile", expect.objectContaining({ name: "Updated Owner" })));
  });

  it("validates password confirmation before submitting", async () => {
    renderPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "old-password" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "different-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    expect(screen.getByRole("alert")).toHaveTextContent("New password and confirmation must match.");
    expect(apiMock.put).not.toHaveBeenCalledWith("/account/password", expect.anything());
  });
});
