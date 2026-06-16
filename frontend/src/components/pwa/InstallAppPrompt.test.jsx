import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InstallAppPrompt from "./InstallAppPrompt";

describe("InstallAppPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = vi.fn(() => ({ matches: false }));
  });

  it("can be dismissed and remembers dismissal", () => {
    render(<InstallAppPrompt />);

    const installEvent = new Event("beforeinstallprompt");
    installEvent.preventDefault = vi.fn();
    installEvent.prompt = vi.fn();
    installEvent.userChoice = Promise.resolve({ outcome: "dismissed" });

    act(() => {
      window.dispatchEvent(installEvent);
    });

    expect(screen.getAllByText("Install MenuDIGI").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Maybe later" }));

    expect(localStorage.getItem("menudigi_install_prompt_dismissed")).toBe("1");
    expect(screen.queryByText("Install MenuDIGI")).not.toBeInTheDocument();
  });
});
