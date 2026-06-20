import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import StaffPage from "./StaffPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ authenticated: true, user: { role: "shop_owner" } }),
}));

describe("StaffPage", () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === "/shops") return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "QA Cafe" }] } } });
      if (url.includes("/branches")) return Promise.resolve({ data: { data: { branches: [] } } });
      return Promise.resolve({ data: { data: { staff: [] } } });
    });
  });

  it("opens Add staff in CrudFormModal", async () => {
    render(<StaffPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Add staff" }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Add staff" })).toBeInTheDocument());
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
