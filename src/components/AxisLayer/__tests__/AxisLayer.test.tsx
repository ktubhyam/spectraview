import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { AxisLayer } from "../AxisLayer";
import { LIGHT_THEME } from "../../../utils/colors";
import type { ThemeColors } from "../../../utils/colors";

/** Helper to render AxisLayer wrapped in an SVG element. */
function renderAxisLayer(overrides: Partial<Parameters<typeof AxisLayer>[0]> = {}) {
  const defaultProps = {
    xScale: scaleLinear().domain([4000, 400]).range([0, 715]),
    yScale: scaleLinear().domain([0, 1]).range([330, 0]),
    width: 715,
    height: 330,
    colors: LIGHT_THEME as ThemeColors,
    showGrid: true,
    ...overrides,
  };

  return render(
    <svg>
      <AxisLayer {...defaultProps} />
    </svg>,
  );
}

describe("AxisLayer", () => {
  it("renders x-axis tick labels", () => {
    const { container } = renderAxisLayer();

    // X-axis ticks are in a <g> translated to the bottom, each with a <text>
    // The TICK_COUNT is 8, so we expect 8 x-axis tick labels
    const xAxisGroup = container.querySelector(`g[transform="translate(0, 330)"]`);
    expect(xAxisGroup).toBeTruthy();

    const tickTexts = xAxisGroup!.querySelectorAll("text");
    // 8 tick labels + possibly 0 or 1 axis label = at least 8
    const tickLabels = Array.from(tickTexts).filter(
      (t) => t.getAttribute("font-size") === "11",
    );
    expect(tickLabels.length).toBe(8);
  });

  it("renders y-axis tick labels", () => {
    const { container } = renderAxisLayer();

    // Y-axis ticks: TICK_COUNT - 2 = 6 ticks
    // They have textAnchor="end" and fontSize=11
    const allTexts = container.querySelectorAll("text");
    const yTickLabels = Array.from(allTexts).filter(
      (t) =>
        t.getAttribute("text-anchor") === "end" &&
        t.getAttribute("font-size") === "11",
    );
    expect(yTickLabels.length).toBe(6);
  });

  it("renders grid lines when showGrid=true", () => {
    const { container } = renderAxisLayer({ showGrid: true });

    // Grid lines have strokeWidth=0.5
    const gridLines = container.querySelectorAll('line[stroke-width="0.5"]');
    // 8 x-grid + 6 y-grid = 14
    expect(gridLines.length).toBe(14);
  });

  it("hides grid lines when showGrid=false", () => {
    const { container } = renderAxisLayer({ showGrid: false });

    const gridLines = container.querySelectorAll('line[stroke-width="0.5"]');
    expect(gridLines.length).toBe(0);
  });

  it("renders x-axis label", () => {
    const { container } = renderAxisLayer({ xLabel: "Wavenumber (cm⁻¹)" });

    const labels = Array.from(container.querySelectorAll("text")).filter(
      (t) => t.textContent === "Wavenumber (cm⁻¹)",
    );
    expect(labels.length).toBe(1);
    expect(labels[0].getAttribute("font-size")).toBe("13");
  });

  it("renders y-axis label", () => {
    const { container } = renderAxisLayer({ yLabel: "Absorbance" });

    const labels = Array.from(container.querySelectorAll("text")).filter(
      (t) => t.textContent === "Absorbance",
    );
    expect(labels.length).toBe(1);
    expect(labels[0].getAttribute("font-size")).toBe("13");
  });
});
