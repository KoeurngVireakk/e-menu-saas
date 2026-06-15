import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

describe("operation status badges", () => {
  it("renders order status text labels", () => {
    render(<OrderStatusBadge value="preparing" />);

    expect(screen.getByText("preparing")).toBeInTheDocument();
  });

  it("normalizes confirmed payment status to paid", () => {
    render(<PaymentStatusBadge value="confirmed" />);

    expect(screen.getByText("paid")).toBeInTheDocument();
  });
});
