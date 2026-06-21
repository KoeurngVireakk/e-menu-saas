import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Modal from "./Modal";

describe("Modal", () => {
  afterEach(() => cleanup());

  it("renders a labeled dialog, focuses it, and closes with Escape", async () => {
    const close = vi.fn();

    render(<Modal open title="Product options" onClose={close}><p>Choose required options.</p></Modal>);

    const dialog = screen.getByRole("dialog", { name: "Product options" });
    await waitFor(() => expect(dialog).toHaveFocus());
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(close).toHaveBeenCalledOnce();
  });

  it("keeps footer actions above the mobile safe area", () => {
    render(<Modal open title="Review order" footer={<button type="button">Continue</button>}>Order details</Modal>);

    expect(screen.getByRole("button", { name: "Continue" }).parentElement).toHaveClass("pb-[max(1rem,env(safe-area-inset-bottom))]");
  });
});
