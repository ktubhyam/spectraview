import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toolbar } from "../Toolbar";

describe("Toolbar", () => {
  const defaultProps = {
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onReset: vi.fn(),
    isZoomed: false,
    theme: "light" as const,
  };

  it("renders zoom in, out, reset buttons", () => {
    render(<Toolbar {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset zoom" })).toBeInTheDocument();
  });

  it("calls onZoomIn when clicked", async () => {
    const onZoomIn = vi.fn();
    render(<Toolbar {...defaultProps} onZoomIn={onZoomIn} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(onZoomIn).toHaveBeenCalledOnce();
  });

  it("calls onZoomOut when clicked", async () => {
    const onZoomOut = vi.fn();
    render(<Toolbar {...defaultProps} onZoomOut={onZoomOut} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Zoom out" }));

    expect(onZoomOut).toHaveBeenCalledOnce();
  });

  it("calls onReset when clicked", async () => {
    const onReset = vi.fn();
    render(<Toolbar {...defaultProps} onReset={onReset} isZoomed={true} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Reset zoom" }));

    expect(onReset).toHaveBeenCalledOnce();
  });

  it("disables reset when not zoomed", () => {
    render(<Toolbar {...defaultProps} isZoomed={false} />);

    const resetButton = screen.getByRole("button", { name: "Reset zoom" });
    expect(resetButton).toBeDisabled();
  });

  it("enables reset when zoomed", () => {
    render(<Toolbar {...defaultProps} isZoomed={true} />);

    const resetButton = screen.getByRole("button", { name: "Reset zoom" });
    expect(resetButton).toBeEnabled();
  });

  it("applies light theme styles", () => {
    render(<Toolbar {...defaultProps} theme="light" />);

    const zoomInButton = screen.getByRole("button", { name: "Zoom in" });
    // jsdom converts hex colors to rgb() format
    expect(zoomInButton.style.background).toBe("rgb(255, 255, 255)");
    expect(zoomInButton.style.color).toBe("rgb(55, 65, 81)");
    expect(zoomInButton.style.borderColor).toBe("rgb(209, 213, 219)");
  });

  it("applies dark theme styles", () => {
    render(<Toolbar {...defaultProps} theme="dark" />);

    const zoomInButton = screen.getByRole("button", { name: "Zoom in" });
    // jsdom converts hex colors to rgb() format
    expect(zoomInButton.style.background).toBe("rgb(31, 41, 55)");
    expect(zoomInButton.style.color).toBe("rgb(209, 213, 219)");
    expect(zoomInButton.style.borderColor).toBe("rgb(75, 85, 99)");
  });
});
