import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Tabs from "./Tabs";

const tabs = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

describe("Tabs", () => {
  it("exposes selected state and supports arrow-key navigation", () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} active="active" onChange={onChange} />);

    const active = screen.getByRole("tab", { name: "Active" });
    expect(active).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(active, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("inactive");
    expect(screen.getByRole("tab", { name: "Inactive" })).toHaveFocus();
  });
});
