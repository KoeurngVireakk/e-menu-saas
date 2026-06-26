import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import { LanguageProvider } from "../../../i18n";
import ReviewsPage from "./ReviewsPage";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "shop_owner" } }),
}));

vi.mock("../../../api/axios", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

let queryClient;

function renderReviewsPage() {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ReviewsPage />
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe("ReviewsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "QA Cafe" }] } } });
      }

      if (url === "/shops/1/reviews") {
        return Promise.resolve({
          data: {
            data: {
              reviews: [
                {
                  id: 10,
                  rating: 5,
                  comment: "Great service.",
                  status: "visible",
                  created_at: "2026-06-26T02:00:00Z",
                  branch: { id: 2, name: "Main Branch" },
                  order: { id: 3, order_number: "ORD-100", order_status: "completed", payment_status: "paid" },
                },
              ],
              summary: { count: 1, average_rating: 5, visible_count: 1, hidden_count: 0, reviewed_count: 0 },
              pagination: { from: 1, to: 1, total: 1 },
            },
          },
        });
      }

      return Promise.resolve({ data: { data: {} } });
    });
    api.put.mockResolvedValue({ data: { data: { review: { id: 10, status: "hidden" } } } });
  });

  afterEach(() => {
    queryClient?.clear();
    cleanup();
  });

  it("renders real review rows and moderation actions", async () => {
    renderReviewsPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: "Reviews" })).toBeInTheDocument());
    expect(await screen.findByText("Great service.")).toBeInTheDocument();
    expect(screen.getByText("ORD-100")).toBeInTheDocument();
    expect(screen.getByText("Main Branch")).toBeInTheDocument();
    expect(screen.getByText("5.0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hide" }));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith("/reviews/10/status", { status: "hidden" }));
  });

  it("shows the no-results state when filters return no reviews", async () => {
    api.get.mockImplementation((url, config) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "QA Cafe" }] } } });
      }

      if (url === "/shops/1/reviews" && config?.params?.rating === "4") {
        return Promise.resolve({ data: { data: { reviews: [], summary: { count: 0 }, pagination: { total: 0 } } } });
      }

      return Promise.resolve({ data: { data: { reviews: [], summary: { count: 0 }, pagination: { total: 0 } } } });
    });

    renderReviewsPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: "Reviews" })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Rating"), { target: { value: "4" } });
    expect(await screen.findByText("No reviews match these filters")).toBeInTheDocument();
  });
});
