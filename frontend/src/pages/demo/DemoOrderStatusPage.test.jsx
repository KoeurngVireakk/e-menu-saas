import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import DemoOrderStatusPage from "./DemoOrderStatusPage";

describe("DemoOrderStatusPage", () => {
  it("shows the priced simulation and clear safety state", () => {
    render(
      <MemoryRouter initialEntries={[{
        pathname: "/demo/order-status",
        search: "?locale=en",
        state: {
          message: "No data was stored.",
          order: {
            order_number: "DEMO-PREVIEW",
            grand_total: 18000,
            currency_code: "KHR",
            shop: { slug: "harbor-table-demo" },
            branch: { id: 1 },
            dining_table: { table_code: "T01" },
            items: [{ product_name: "Jasmine cold brew tea", quantity: 2, total_price: 18000 }],
          },
        },
      }]}>
        <Routes><Route path="/demo/order-status" element={<DemoOrderStatusPage />} /></Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Your simulated order is ready" })).toBeInTheDocument();
    expect(screen.getByText("2 × Jasmine cold brew tea")).toBeInTheDocument();
    expect(screen.getByText(/Nothing was charged or stored/i)).toBeInTheDocument();
  });
});
