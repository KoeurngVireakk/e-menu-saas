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
});
