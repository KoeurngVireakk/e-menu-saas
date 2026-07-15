import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Save } from "lucide-react";
import AppButton from "./AppButton";

describe("AppButton", () => {
  afterEach(() => cleanup());

  it("renders loading and disabled state", () => {
    render(<AppButton loading iconLeft={<Save data-testid="save-icon" />}>Saving</AppButton>);

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByTestId("save-icon")).toBeInTheDocument();
  });

  it("allows long Khmer labels to wrap naturally", () => {
    render(<AppButton>បន្តទៅការទូទាត់ និងពិនិត្យការកុម្ម៉ង់</AppButton>);

    expect(screen.getByRole("button")).not.toHaveClass("whitespace-nowrap");
    expect(screen.getByRole("button")).toHaveClass("khmer-button", "leading-snug");
  });
});
