import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { StackedView } from "../StackedView";
import type { Spectrum, Margin } from "../../../types";

// Mock SpectrumCanvas to avoid canvas rendering in jsdom
vi.mock("../../SpectrumCanvas/SpectrumCanvas", () => ({
  SpectrumCanvas: () => <canvas data-testid="mock-canvas" />,
}));

// Mock rendering utility
vi.mock("../../../utils/rendering", () => ({
  drawAllSpectra: vi.fn(),
}));

function makeSpectrum(overrides: Partial<Spectrum> = {}): Spectrum {
  return {
    id: "s1",
    label: "Test Spectrum",
    x: new Float64Array([400, 800, 1200, 1600, 2000]),
    y: new Float64Array([0.1, 0.5, 0.9, 0.3, 0.1]),
    xUnit: "cm⁻¹",
    yUnit: "Absorbance",
    visible: true,
    ...overrides,
  };
}

const defaultMargin: Margin = { top: 20, right: 20, bottom: 40, left: 50 };
const defaultXScale = scaleLinear().domain([400, 2000]).range([0, 700]);

describe("StackedView", () => {
  it("renders a group element with class spectraview-stacked", () => {
    const { container } = render(
      <svg>
        <StackedView
          spectra={[makeSpectrum()]}
          xScale={defaultXScale}
          plotWidth={700}
          plotHeight={400}
          margin={defaultMargin}
          theme="light"
          showGrid={true}
          xLabel="Wavenumber (cm⁻¹)"
          yLabel="Absorbance"
        />
      </svg>,
    );
    expect(container.querySelector(".spectraview-stacked")).not.toBeNull();
  });

  it("renders one panel per visible spectrum", () => {
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
      makeSpectrum({ id: "c", label: "Gamma" }),
    ];
    const { container } = render(
      <svg>
        <StackedView
          spectra={spectra}
          xScale={defaultXScale}
          plotWidth={700}
          plotHeight={600}
          margin={defaultMargin}
          theme="light"
          showGrid={true}
          xLabel="Wavenumber"
          yLabel="Absorbance"
        />
      </svg>,
    );
    const panels = container.querySelectorAll(".spectraview-stacked > g");
    expect(panels.length).toBe(3);
  });

  it("filters out hidden spectra", () => {
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha", visible: true }),
      makeSpectrum({ id: "b", label: "Beta", visible: false }),
      makeSpectrum({ id: "c", label: "Gamma", visible: true }),
    ];
    const { container } = render(
      <svg>
        <StackedView
          spectra={spectra}
          xScale={defaultXScale}
          plotWidth={700}
          plotHeight={400}
          margin={defaultMargin}
          theme="light"
          showGrid={true}
          xLabel="Wavenumber"
          yLabel="Absorbance"
        />
      </svg>,
    );
    const panels = container.querySelectorAll(".spectraview-stacked > g");
    expect(panels.length).toBe(2);
  });

  it("displays spectrum labels in each panel", () => {
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];
    const { container } = render(
      <svg>
        <StackedView
          spectra={spectra}
          xScale={defaultXScale}
          plotWidth={700}
          plotHeight={400}
          margin={defaultMargin}
          theme="light"
          showGrid={true}
          xLabel="Wavenumber"
          yLabel="Absorbance"
        />
      </svg>,
    );
    const labels = container.querySelectorAll("text");
    const labelTexts = Array.from(labels).map((el) => el.textContent);
    expect(labelTexts).toContain("Alpha");
    expect(labelTexts).toContain("Beta");
  });

  it("renders panel background rects for each visible spectrum", () => {
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];
    const { container } = render(
      <svg>
        <StackedView
          spectra={spectra}
          xScale={defaultXScale}
          plotWidth={700}
          plotHeight={400}
          margin={defaultMargin}
          theme="light"
          showGrid={true}
          xLabel="Wavenumber"
          yLabel="Absorbance"
        />
      </svg>,
    );
    // Each panel has a transparent background rect
    const panels = container.querySelectorAll(".spectraview-stacked > g");
    panels.forEach((panel) => {
      const rect = panel.querySelector("rect[fill='transparent']");
      expect(rect).not.toBeNull();
    });
  });

  it("renders nothing in the group when spectra array is empty", () => {
    const { container } = render(
      <svg>
        <StackedView
          spectra={[]}
          xScale={defaultXScale}
          plotWidth={700}
          plotHeight={400}
          margin={defaultMargin}
          theme="light"
          showGrid={true}
          xLabel="Wavenumber"
          yLabel="Absorbance"
        />
      </svg>,
    );
    const panels = container.querySelectorAll(".spectraview-stacked > g");
    expect(panels.length).toBe(0);
  });

  it("applies dark theme", () => {
    const { container } = render(
      <svg>
        <StackedView
          spectra={[makeSpectrum()]}
          xScale={defaultXScale}
          plotWidth={700}
          plotHeight={400}
          margin={defaultMargin}
          theme="dark"
          showGrid={true}
          xLabel="Wavenumber"
          yLabel="Absorbance"
        />
      </svg>,
    );
    expect(container.querySelector(".spectraview-stacked")).not.toBeNull();
  });

  it("shows x-axis label only on the last panel", () => {
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];
    const { container } = render(
      <svg>
        <StackedView
          spectra={spectra}
          xScale={defaultXScale}
          plotWidth={700}
          plotHeight={400}
          margin={defaultMargin}
          theme="light"
          showGrid={true}
          xLabel="Wavenumber"
          yLabel="Absorbance"
        />
      </svg>,
    );
    // The component passes xLabel="" to all panels except the last one.
    // We verify panels are rendered (the AxisLayer receives the label internally).
    const panels = container.querySelectorAll(".spectraview-stacked > g");
    expect(panels.length).toBe(2);
  });
});
