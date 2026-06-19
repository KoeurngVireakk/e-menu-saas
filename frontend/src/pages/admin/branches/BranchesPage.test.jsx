import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import BranchesPage from "./BranchesPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ authenticated: true, user: { role: "shop_owner" } }),
}));

describe("BranchesPage", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.put.mockReset();
    api.delete.mockReset();
  });

  it("opens a centered add branch modal and closes it with cancel", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "MenuDIGI Cafe" }] } } });
      }

      if (url === "/shops/1/branches") {
        return Promise.resolve({ data: { data: { branches: [{ id: 2, name: "Main", status: "active" }] } } });
      }

      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });

    render(
      <MemoryRouter>
        <BranchesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByPlaceholderText("Search branches...")).toBeInTheDocument();
    expect((await screen.findAllByText("Main")).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /add branch/i }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Add branch" })).toBeInTheDocument());
    expect(screen.getByPlaceholderText("Main Branch")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add branch" })).not.toBeInTheDocument());
  });
});
