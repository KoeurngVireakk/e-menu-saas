import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import PrintStationsPage from "./PrintStationsPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "shop_owner" } }),
}));

describe("PrintStationsPage", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.put.mockReset();
    api.delete.mockReset();
  });

  it("renders station filters and opens the centered add station modal", async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: { shops: [{ id: 1, name: "QA Cafe" }] } } })
      .mockResolvedValueOnce({ data: { data: { branches: [{ id: 2, name: "Main" }] } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            print_stations: [
              { id: 10, name: "Kitchen pass", type: "kitchen", paper_size: "80mm", is_default: true, status: "active", branch: { name: "Main" } },
            ],
          },
        },
      });

    render(<PrintStationsPage />);

    expect(await screen.findByPlaceholderText("Search print stations...")).toBeInTheDocument();
    expect(await screen.findByText("Kitchen pass")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add station/i }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Add print station" })).toBeInTheDocument());
    expect(screen.getByLabelText(/station name/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Branch")).toBeInTheDocument();
  });
});
