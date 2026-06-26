import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import StaffPage from "./StaffPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ authenticated: true, user: { role: "shop_owner" } }),
}));

let queryClient;

function renderStaffPage() {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <StaffPage />
    </QueryClientProvider>,
  );
}

describe("StaffPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/shops") return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "QA Cafe" }] } } });
      if (url.includes("/branches")) return Promise.resolve({ data: { data: { branches: [] } } });
      return Promise.resolve({ data: { data: { staff: [] } } });
    });
  });

  afterEach(() => {
    queryClient?.clear();
    cleanup();
  });

  it("opens Add staff in CrudFormModal", async () => {
    renderStaffPage();

    await screen.findByText("No staff assigned yet.");

    fireEvent.click(screen.getByRole("button", { name: "Add staff" }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Add staff" })).toBeInTheDocument());
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders premium search and filters for staff list review", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/shops") return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "QA Cafe" }] } } });
      if (url.includes("/branches")) return Promise.resolve({ data: { data: { branches: [{ id: 7, name: "Main Branch" }] } } });
      return Promise.resolve({
        data: {
          data: {
            staff: [
              { id: 10, user_id: 20, role: "manager", status: "active", branch_id: 7, user: { id: 20, name: "Dara Manager", email: "dara@example.test" }, branch: { id: 7, name: "Main Branch" } },
            ],
          },
        },
      });
    });

    renderStaffPage();

    await screen.findByText("Dara Manager");
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Branch")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "missing" } });
    expect(screen.getByText("No staff match these filters.")).toBeInTheDocument();
  });
});
