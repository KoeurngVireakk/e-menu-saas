import { render, screen } from "@testing-library/react";
import { CreditCard } from "lucide-react";
import { describe, expect, it } from "vitest";
import AppMetricCard from "./AppMetricCard";

describe("AppMetricCard", () => {
  it("announces the metric title and description as a named panel", () => {
    render(
      <AppMetricCard
        title="Today sales"
        value="120,000 KHR"
        description="Confirmed revenue"
        icon={CreditCard}
      />,
    );

    const metric = screen.getByRole("region", { name: "Today sales" });
    expect(metric).toHaveAccessibleDescription("Confirmed revenue");
    expect(screen.getByText("120,000 KHR")).toBeInTheDocument();
  });
});
