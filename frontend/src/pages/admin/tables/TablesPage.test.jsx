import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../../api/axios";
import { LanguageProvider } from "../../../i18n";
import TablesPage from "./TablesPage";

vi.mock("../../../api/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "shop_owner" } }),
}));

describe("TablesPage", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.put.mockReset();
    api.delete.mockReset();
  });

  it("opens a centered add table modal and closes it with cancel", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/shops") {
        return Promise.resolve({ data: { data: { shops: [{ id: 1, name: "MenuDIGI Cafe" }] } } });
      }

      if (url === "/shops/1/branches") {
        return Promise.resolve({ data: { data: { branches: [{ id: 2, name: "Main" }] } } });
      }

      if (url === "/branches/2/tables") {
        return Promise.resolve({ data: { data: { tables: [{ id: 3, table_name: "Table 01", table_code: "T01", status: "active" }] } } });
      }

      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });

    render(
      <MemoryRouter>
        <LanguageProvider>
          <TablesPage />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByPlaceholderText("Search tables...")).toBeInTheDocument();
    expect(await screen.findByText("Table 01")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add table/i }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "Add table" })).toBeInTheDocument());
    expect(screen.getByPlaceholderText("Table 01")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add table" })).not.toBeInTheDocument());
  });
});
