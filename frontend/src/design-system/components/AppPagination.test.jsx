import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppPagination from "./AppPagination";

describe("AppPagination", () => {
  afterEach(() => cleanup());

  it("announces position and exposes safe previous and next actions", () => {
    const change = vi.fn();
    render(<AppPagination page={2} pageCount={4} onPageChange={change} summary="Showing orders 11-20 of 40" />);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByText("Showing orders 11-20 of 40")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(change).toHaveBeenNthCalledWith(1, 1);
    expect(change).toHaveBeenNthCalledWith(2, 3);
  });

  it("disables navigation at the available boundaries", () => {
    const { rerender } = render(<AppPagination page={1} pageCount={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();

    rerender(<AppPagination page={3} pageCount={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
