import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../../i18n";
import NotificationsPage from "./NotificationsPage";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
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
          <NotificationsPage />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("NotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    apiMock.get.mockResolvedValue({
      data: {
        data: {
          notifications: [],
          meta: { current_page: 1, per_page: 20, total: 0 },
        },
      },
    });
    apiMock.post.mockResolvedValue({ data: { data: { updated: 1 } } });
  });

  it("renders empty state from the real notifications endpoint", async () => {
    renderPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument());
    expect(screen.getByRole("tab", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Unread" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("No notifications")).toBeInTheDocument());
  });

  it("renders notification cards and marks all as read", async () => {
    apiMock.get.mockResolvedValue({
      data: {
        data: {
          notifications: [
            {
              id: 7,
              title: "New order",
              body: "New order: ORD-1",
              category: "orders",
              status: "sent",
              shop: { name: "QA Cafe" },
              read_at: null,
              created_at: "2026-06-21T00:00:00.000000Z",
            },
          ],
          meta: { current_page: 1, per_page: 20, total: 1 },
        },
      },
    });

    renderPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: "New order" })).toBeInTheDocument());
    expect(screen.getByText("New order: ORD-1")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Mark all as read" }).find((button) => !button.disabled));
    await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith("/notifications/read-all"));
  });

  it("renders account activity tab from account activity API", async () => {
    apiMock.get.mockImplementation((url) => {
      if (url === "/account/activity") {
        return Promise.resolve({
          data: {
            data: {
              activity: [
                {
                  id: 1,
                  type: "profile_updated",
                  title: "Profile updated",
                  description: "Your account profile information was updated.",
                  created_at: "2026-06-21T00:00:00.000000Z",
                },
              ],
            },
          },
        });
      }

      return Promise.resolve({ data: { data: { notifications: [], meta: { current_page: 1, per_page: 20, total: 0 } } } });
    });

    renderPage();

    fireEvent.click(await screen.findByRole("tab", { name: "Account" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Profile updated" })).toBeInTheDocument());
  });

  it("renders Khmer notification labels", async () => {
    localStorage.setItem("menudigi_language", "km");
    renderPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: "ការជូនដំណឹង" })).toBeInTheDocument());
    expect(screen.getByRole("tab", { name: "គណនី" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "សម្គាល់ទាំងអស់ថាបានអាន" })).toBeInTheDocument();
  });
});
