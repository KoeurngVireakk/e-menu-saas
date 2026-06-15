import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InvoicePrint from "./InvoicePrint";
import KitchenTicketPrint from "./KitchenTicketPrint";
import ReceiptPrint from "./ReceiptPrint";

const basePrint = {
  paper_size: "80mm",
  generated_at: "2026-06-15T10:00:00Z",
  shop: { name: "QA Cafe", currency_code: "KHR" },
  branch: { name: "Main Branch" },
  order: {
    order_number: "ORD-1",
    order_type: "dine_in",
    order_status: "pending",
    payment_status: "paid",
    table: "A1",
    customer_name: "QA Customer",
  },
  items: [
    {
      id: 1,
      product_name: "Iced Latte",
      quantity: 2,
      total_price: 24000,
      selected_options: [{ option_name: "Size", values: [{ name: "Large" }] }],
    },
  ],
  totals: {
    subtotal: 24000,
    discount_total: 0,
    service_charge: 0,
    tax_total: 0,
    grand_total: 24000,
    currency_code: "KHR",
  },
};

describe("print components", () => {
  it("renders kitchen ticket fields", () => {
    render(<KitchenTicketPrint print={basePrint} />);

    expect(screen.getByText("Kitchen Ticket")).toBeInTheDocument();
    expect(screen.getByText("ORD-1")).toBeInTheDocument();
    expect(screen.getByText("2 x Iced Latte")).toBeInTheDocument();
    expect(screen.getByText(/Size: Large/)).toBeInTheDocument();
  });

  it("renders receipt totals", () => {
    render(<ReceiptPrint print={{ ...basePrint, receipt_number: "RCPT-ORD-1" }} />);

    expect(screen.getByText("Receipt")).toBeInTheDocument();
    expect(screen.getByText("RCPT-ORD-1")).toBeInTheDocument();
    expect(screen.getByText("Grand total")).toBeInTheDocument();
    expect(screen.getAllByText(/KHR/).length).toBeGreaterThan(0);
  });

  it("renders invoice balance fields", () => {
    render(
      <InvoicePrint
        print={{
          ...basePrint,
          invoice: { invoice_number: "INV-1", status: "paid", customer_name: "QA Customer" },
          totals: { ...basePrint.totals, deposit_amount: 0, paid_amount: 24000, balance_due: 0 },
        }}
      />,
    );

    expect(screen.getByText("Invoice")).toBeInTheDocument();
    expect(screen.getByText("INV-1")).toBeInTheDocument();
    expect(screen.getByText("Balance")).toBeInTheDocument();
  });
});
