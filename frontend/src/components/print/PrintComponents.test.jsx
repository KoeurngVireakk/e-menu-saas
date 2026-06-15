import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DailyClosingPrint from "./DailyClosingPrint";
import InvoicePrint from "./InvoicePrint";
import KitchenTicketPrint from "./KitchenTicketPrint";
import ReceiptPrint from "./ReceiptPrint";
import SalesReportPrint from "./SalesReportPrint";
import ShiftReportPrint from "./ShiftReportPrint";

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

  it("renders sales report currency totals", () => {
    render(
      <SalesReportPrint
        report={{
          shop: { name: "QA Cafe" },
          summary: { ...basePrint.totals, total_orders: 2, completed_orders: 1, net_sales: 24000, paid_total: 24000, unpaid_total: 0, date_from: "2026-06-15", date_to: "2026-06-15" },
          payment_methods: { methods: { cash: { paid_total: 24000 } } },
          products: [{ product_id: 1, product_name: "Iced Latte", quantity_sold: 2, net_total: 24000 }],
        }}
      />,
    );

    expect(screen.getByText("Sales Report")).toBeInTheDocument();
    expect(screen.getAllByText("QA Cafe").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/24,000 KHR/).length).toBeGreaterThan(0);
  });

  it("renders daily closing cash fields", () => {
    render(
      <DailyClosingPrint
        closing={{
          shop: { name: "QA Cafe" },
          branch: { name: "Main Branch" },
          closer: { name: "Owner" },
          closing_date: "2026-06-15",
          currency_code: "KHR",
          expected_cash_total: 24000,
          counted_cash_total: 23000,
          cash_difference: -1000,
          sales_summary_json: { net_sales: 24000, paid_total: 24000 },
          payment_totals_json: { methods: { cash: { paid_total: 24000 } } },
        }}
      />,
    );

    expect(screen.getByText("Daily Closing")).toBeInTheDocument();
    expect(screen.getByText("Expected cash")).toBeInTheDocument();
    expect(screen.getByText("-1,000 KHR")).toBeInTheDocument();
  });

  it("renders shift report totals", () => {
    render(
      <ShiftReportPrint
        shift={{
          shop: { name: "QA Cafe", currency_code: "KHR" },
          branch: { name: "Main Branch" },
          user: { name: "Cashier" },
          shift_code: "SHIFT-1",
          opening_float: 20000,
          cash_payment_total: 14500,
          cash_in_total: 5000,
          cash_out_total: 3000,
          expected_cash_total: 36500,
          counted_cash_total: 36000,
          cash_difference: -500,
          movements: [{ id: 1, type: "cash_in", reason: "Extra float", amount: 5000 }],
        }}
      />,
    );

    expect(screen.getByText("Shift Report")).toBeInTheDocument();
    expect(screen.getByText("SHIFT-1")).toBeInTheDocument();
    expect(screen.getByText("Expected cash")).toBeInTheDocument();
    expect(screen.getByText("-500 KHR")).toBeInTheDocument();
  });
});
