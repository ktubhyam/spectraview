import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { RegionSelector } from "../RegionSelector";
import { LIGHT_THEME } from "../../../utils/colors";
import type { ThemeColors } from "../../../utils/colors";
import { createTestRegions } from "../../../test/helpers";

/** Helper to render RegionSelector wrapped in an SVG. */
function renderRegionSelector(
  overrides: Partial<Parameters<typeof RegionSelector>[0]> = {},
) {
  const defaultProps = {
    regions: createTestRegions(),
    xScale: scaleLinear().domain([400, 4000]).range([0, 715]),
    height: 330,
    colors: LIGHT_THEME as ThemeColors,
    ...overrides,
  };

  return render(
    <svg>
      <RegionSelector {...defaultProps} />
    </svg>,
  );
}

describe("RegionSelector", () => {
  it("renders rect for each region", () => {
    const { container } = renderRegionSelector();

    const rects = container.querySelectorAll(".spectraview-regions > g > rect");
    // createTestRegions() returns 2 regions
    expect(rects.length).toBe(2);
  });

  it("renders region labels", () => {
    const { container } = renderRegionSelector();

    const texts = container.querySelectorAll(".spectraview-regions text");
    const labels = Array.from(texts).map((t) => t.textContent);

    expect(labels).toContain("Amide I");
    expect(labels).toContain("C-H stretch");
  });

  it("uses custom color when provided", () => {
    const { container } = renderRegionSelector();

    const rects = container.querySelectorAll(".spectraview-regions > g > rect");
    // First region has no custom color, should use theme default
    expect(rects[0].getAttribute("fill")).toBe(LIGHT_THEME.regionFill);

    // Second region has color: "rgba(255, 0, 0, 0.2)"
    expect(rects[1].getAttribute("fill")).toBe("rgba(255, 0, 0, 0.2)");
  });

  it("handles empty regions array", () => {
    const { container } = renderRegionSelector({ regions: [] });

    const rects = container.querySelectorAll(".spectraview-regions > g > rect");
    expect(rects.length).toBe(0);

    const texts = container.querySelectorAll(".spectraview-regions text");
    expect(texts.length).toBe(0);
  });
});
