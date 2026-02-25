import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Tooltip } from "../Tooltip";
import { LIGHT_THEME } from "../../../utils/colors";
import type { Spectrum, Peak } from "../../../types";

const colors = LIGHT_THEME;

const spectra: Spectrum[] = [
  { id: "s1", label: "Ethanol", x: [100, 200, 300], y: [0.5, 1.0, 0.3] },
  { id: "s2", label: "Water", x: [100, 200, 300], y: [0.2, 0.8, 0.6] },
];

const peaks: Peak[] = [
  { x: 200, y: 1.0, label: "1000 cm⁻¹" },
];

function renderTooltip(data: { px: number; py: number; dataX: number; dataY: number } | null) {
  return render(
    <svg>
      <Tooltip
        data={data}
        spectra={spectra}
        peaks={peaks}
        plotWidth={500}
        plotHeight={300}
        colors={colors}
      />
    </svg>,
  );
}

describe("Tooltip", () => {
  it("returns null when data is null", () => {
    const { container } = renderTooltip(null);
    expect(container.querySelector(".spectraview-tooltip")).toBeNull();
  });

  it("renders tooltip group when data provided", () => {
    const { container } = renderTooltip({ px: 100, py: 100, dataX: 200, dataY: 1.0 });
    expect(container.querySelector(".spectraview-tooltip")).not.toBeNull();
  });

  it("shows X value in header", () => {
    const { container } = renderTooltip({ px: 100, py: 100, dataX: 200, dataY: 1.0 });
    const texts = container.querySelectorAll("text");
    const header = texts[0];
    expect(header.textContent).toContain("200");
  });

  it("renders colored dots for each spectrum", () => {
    const { container } = renderTooltip({ px: 100, py: 100, dataX: 200, dataY: 1.0 });
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2); // One per spectrum
  });

  it("shows nearest peak label", () => {
    const { container } = renderTooltip({ px: 100, py: 100, dataX: 200, dataY: 1.0 });
    const texts = Array.from(container.querySelectorAll("text"));
    const peakText = texts.find((t) => t.textContent?.includes("Peak:"));
    expect(peakText).toBeDefined();
    expect(peakText!.textContent).toContain("1000 cm⁻¹");
  });
});
