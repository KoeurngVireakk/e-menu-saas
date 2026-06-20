import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import ShiftsPage from "./ShiftsPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ authenticated: true, user: { id: 1, role: "shop_owner" } }),
}));

describe("ShiftsPage", () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === "/shops") return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "QA Cafe", currency_code: "KHR" }] } } });
      if (url.includes("/branches")) return Promise.resolve({ data: { data: { branches: [{ id: 2, name: "Main" }] } } });
      return Promise.resolve({ data: { data: { shifts: [] } } });
    });
  });

  it("opens the shift form in a centered accessible modal", async () => {
    render(<ShiftsPage />);

    const openButton = await screen.findByRole("button", { name: "Open shift" });
    await waitFor(() => expect(openButton).toBeEnabled());
    fireEvent.click(openButton);

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Open Shift" })).toBeInTheDocument());
    expect(screen.getByLabelText("Opening float")).toBeInTheDocument();
  });
});
