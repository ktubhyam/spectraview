import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Legend } from "../Legend";
import type { Spectrum } from "../../../types";

function makeSpectrum(overrides: Partial<Spectrum> = {}): Spectrum {
  return {
    id: "s1",
    label: "Test Spectrum",
    x: new Float64Array([1, 2, 3]),
    y: new Float64Array([10, 20, 30]),
    ...overrides,
  };
}

describe("Legend", () => {
  it("renders nothing with a single spectrum", () => {
    const { container } = render(
      <Legend spectra={[makeSpectrum()]} theme="light" position="bottom" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders legend items for multiple spectra", () => {
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];
    render(<Legend spectra={spectra} theme="light" position="bottom" />);
    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.getByText("Beta")).toBeDefined();
  });

  it("calls onToggleVisibility when clicking a legend item", () => {
    const onToggle = vi.fn();
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];
    render(
      <Legend
        spectra={spectra}
        theme="light"
        position="bottom"
        onToggleVisibility={onToggle}
      />,
    );
    fireEvent.click(screen.getByText("Alpha"));
    expect(onToggle).toHaveBeenCalledWith("a");
  });

  it("calls onHighlight on hover", () => {
    const onHighlight = vi.fn();
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];
    render(
      <Legend
        spectra={spectra}
        theme="light"
        position="bottom"
        onHighlight={onHighlight}
      />,
    );
    fireEvent.mouseEnter(screen.getByText("Alpha"));
    expect(onHighlight).toHaveBeenCalledWith("a");
    fireEvent.mouseLeave(screen.getByText("Alpha"));
    expect(onHighlight).toHaveBeenCalledWith(null);
  });

  it("shows hidden spectra with reduced opacity", () => {
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha", visible: false }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];
    const { container } = render(
      <Legend spectra={spectra} theme="light" position="bottom" />,
    );
    const items = container.querySelectorAll("[role='listitem']");
    expect(items[0].getAttribute("style")).toContain("0.4");
  });

  it("renders with dark theme", () => {
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];
    const { container } = render(
      <Legend spectra={spectra} theme="dark" position="bottom" />,
    );
    expect(container.querySelector(".spectraview-legend")).toBeDefined();
  });

  it("has accessible role and aria-label", () => {
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];
    render(<Legend spectra={spectra} theme="light" position="bottom" />);
    expect(screen.getByRole("list")).toBeDefined();
    expect(screen.getByLabelText("Spectrum legend")).toBeDefined();
  });
});
