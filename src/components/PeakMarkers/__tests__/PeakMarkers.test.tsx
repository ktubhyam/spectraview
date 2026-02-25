import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { PeakMarkers } from "../PeakMarkers";
import { LIGHT_THEME } from "../../../utils/colors";
import type { ThemeColors } from "../../../utils/colors";
import type { Peak } from "../../../types";
import { createTestPeaks } from "../../../test/helpers";

/** Helper to render PeakMarkers wrapped in an SVG. */
function renderPeakMarkers(overrides: Partial<Parameters<typeof PeakMarkers>[0]> = {}) {
  const defaultProps = {
    peaks: createTestPeaks(),
    xScale: scaleLinear().domain([400, 4000]).range([0, 715]),
    yScale: scaleLinear().domain([0, 1]).range([330, 0]),
    colors: LIGHT_THEME as ThemeColors,
    ...overrides,
  };

  return render(
    <svg>
      <PeakMarkers {...defaultProps} />
    </svg>,
  );
}

describe("PeakMarkers", () => {
  it("renders triangle polygons for each peak", () => {
    const { container } = renderPeakMarkers();

    const polygons = container.querySelectorAll("polygon");
    // 3 peaks from createTestPeaks(), all within domain [400, 4000]
    expect(polygons.length).toBe(3);
  });

  it("renders peak labels", () => {
    const { container } = renderPeakMarkers();

    const texts = container.querySelectorAll("text");
    const labels = Array.from(texts).map((t) => t.textContent);

    expect(labels).toContain("1000");
    expect(labels).toContain("2000");
    expect(labels).toContain("3000");
  });

  it("calls onPeakClick when marker clicked", () => {
    const onPeakClick = vi.fn();
    const peaks = createTestPeaks();
    const { container } = renderPeakMarkers({ peaks, onPeakClick });

    // Click the first peak marker group (the <g> with onClick)
    const peakGroups = container.querySelectorAll(".spectraview-peaks > g");
    expect(peakGroups.length).toBe(3);

    fireEvent.click(peakGroups[0]);

    expect(onPeakClick).toHaveBeenCalledOnce();
    expect(onPeakClick).toHaveBeenCalledWith(peaks[0]);
  });

  it("handles empty peaks array", () => {
    const { container } = renderPeakMarkers({ peaks: [] });

    const polygons = container.querySelectorAll("polygon");
    expect(polygons.length).toBe(0);
  });

  it("culls peaks outside visible domain", () => {
    // Scale domain is [1500, 2500], so only the peak at x=2000 is visible
    const xScale = scaleLinear().domain([1500, 2500]).range([0, 715]);
    const { container } = renderPeakMarkers({ xScale });

    const polygons = container.querySelectorAll("polygon");
    expect(polygons.length).toBe(1);

    const texts = container.querySelectorAll("text");
    expect(texts.length).toBe(1);
    expect(texts[0].textContent).toBe("2000");
  });
});
