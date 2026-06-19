import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api/axios";
import { queryKeys } from "../lib/queryKeys";
import { useCurrentUser, useOrders } from "./useApiQueries";

vi.mock("../api/axios", () => ({
  default: { get: vi.fn() },
}));

function CurrentUserConsumer() {
  const query = useCurrentUser();
  return <span>{query.data?.name || "loading"}</span>;
}

function OrdersConsumer() {
  const query = useOrders({ status: "pending", shop_id: 7 });
  return <span>{query.data?.orders?.length ?? "loading"}</span>;
}

function renderWithQueryClient(ui) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <StrictMode>{ui}</StrictMode>
    </QueryClientProvider>,
  );
}

describe("shared API queries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deduplicates current-user requests across StrictMode consumers", async () => {
    api.get.mockResolvedValue({ data: { data: { user: { id: 1, name: "Owner" } } } });

    renderWithQueryClient(<><CurrentUserConsumer /><CurrentUserConsumer /></>);

    await waitFor(() => expect(screen.getAllByText("Owner")).toHaveLength(2));
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith("/auth/me", expect.objectContaining({ signal: undefined }));
  });

  it("uses stable filter keys and forwards filters to list requests", async () => {
    api.get.mockResolvedValue({ data: { data: { orders: [] } } });

    renderWithQueryClient(<OrdersConsumer />);

    await waitFor(() => expect(screen.getByText("0")).toBeInTheDocument());
    expect(queryKeys.orders({ shop_id: 7, status: "pending" }))
      .toEqual(queryKeys.orders({ status: "pending", shop_id: 7 }));
    expect(api.get).toHaveBeenCalledWith("/orders", expect.objectContaining({
      params: { shop_id: 7, status: "pending" },
      signal: expect.any(AbortSignal),
    }));
  });
});
