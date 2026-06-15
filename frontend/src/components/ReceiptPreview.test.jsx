import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ReceiptPreview from "./ReceiptPreview";

describe("ReceiptPreview", () => {
  it("renders receipt totals and line items", () => {
    render(
      <ReceiptPreview
        receipt={{
          receipt_number: "RCPT-ORD-1",
          totals: {
            subtotal: "10000.00",
            discount_total: "1000.00",
            service_charge: "450.00",
            tax_total: "900.00",
            grand_total: "10350.00",
            currency_code: "KHR",
          },
          order: {
            order_number: "ORD-1",
            payment_status: "unpaid",
            shop: { name: "QA Cafe" },
            branch: { name: "Main" },
            items: [{ id: 1, quantity: 1, product_name: "Latte", total_price: "10000.00", selected_options_json: [] }],
          },
        }}
      />,
    );

    expect(screen.getByText("QA Cafe")).toBeInTheDocument();
    expect(screen.getByText("1 x Latte")).toBeInTheDocument();
    expect(screen.getByText("10,350 KHR")).toBeInTheDocument();
  });
});
