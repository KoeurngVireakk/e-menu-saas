import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppButton from "./AppButton";

describe("AppButton", () => {
  it("renders loading and disabled state", () => {
    render(<AppButton loading>Saving</AppButton>);

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
});
