import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import AppSheet from "./AppSheet";

function SheetHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open editor</button>
      <AppSheet
        open={open}
        title="Edit product"
        description="Update menu availability."
        onClose={() => setOpen(false)}
        footer={<button type="button">Save product</button>}
      >
        Product form
      </AppSheet>
    </>
  );
}

describe("AppSheet", () => {
  it("links its title and description, closes on Escape, and restores focus", async () => {
    render(<SheetHarness />);
    const trigger = screen.getByRole("button", { name: "Open editor" });

    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Edit product" });
    expect(dialog).toHaveAccessibleDescription("Update menu availability.");
    expect(dialog).toHaveClass("h-dvh", "min-w-0", "overflow-hidden");
    expect(screen.getByRole("button", { name: "Save product" }).closest("footer")).toHaveClass("pb-[max(1rem,env(safe-area-inset-bottom))]");
    await waitFor(() => expect(dialog).toHaveFocus());

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
