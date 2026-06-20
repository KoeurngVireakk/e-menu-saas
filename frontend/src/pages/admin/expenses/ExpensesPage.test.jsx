import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import ExpensesPage from "./ExpensesPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ authenticated: true, user: { role: "shop_owner" } }),
}));

describe("ExpensesPage", () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === "/shops") return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "QA Cafe", currency_code: "KHR" }] } } });
      if (url.includes("/branches")) return Promise.resolve({ data: { data: { branches: [] } } });
      if (url === "/expense-categories") return Promise.resolve({ data: { data: { categories: [] } } });
      return Promise.resolve({ data: { data: { expenses: [], summary: {} } } });
    });
  });

  it("opens Add Expense in CrudFormModal", async () => {
    render(<ExpensesPage />);

    fireEvent.click(await screen.findByRole("button", { name: /add expense/i }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Add Expense" })).toBeInTheDocument());
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });
});
