import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import ShopsPage from "./ShopsPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ authenticated: true, user: { role: "shop_owner" } }),
}));

function renderWithQuery(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("ShopsPage", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.delete.mockReset();
  });

  it("renders list actions and opens the edit shop drawer", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          shops: [
            {
              id: 1,
              name: "QA Cafe",
              slug: "qa-cafe",
              currency_code: "KHR",
              status: "active",
              primary_color: "#2563eb",
              secondary_color: "#0f172a",
            },
          ],
        },
      },
    });

    renderWithQuery(<ShopsPage />);

    expect(await screen.findByPlaceholderText("Search shops...")).toBeInTheDocument();
    expect(await screen.findByText("QA Cafe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Edit shop" })).toBeInTheDocument());
    expect(screen.getByLabelText(/shop name/i)).toHaveValue("QA Cafe");
  });

  it("shows an empty state action that opens the add shop drawer", async () => {
    api.get.mockResolvedValue({ data: { data: { shops: [] } } });

    renderWithQuery(<ShopsPage />);

    expect(await screen.findByText("Create your first shop")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /add shop/i })[0]);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Add shop" })).toBeInTheDocument());
    expect(screen.getByPlaceholderText("MenuDIGI Cafe")).toBeInTheDocument();
  });
});
