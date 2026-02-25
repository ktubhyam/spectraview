import { describe, it, expect } from "vitest";
import { scaleLinear } from "d3-scale";
import { generateSvg, LINE_DASH_PATTERNS } from "../svg-export";
import type { Spectrum } from "../../types";

function makeSpectrum(overrides: Partial<Spectrum> = {}): Spectrum {
  return {
    id: "s1",
    label: "Test",
    x: new Float64Array([0, 50, 100]),
    y: new Float64Array([0, 1, 0.5]),
    ...overrides,
  };
}

const xScale = scaleLinear().domain([0, 100]).range([0, 400]);
const yScale = scaleLinear().domain([0, 1]).range([300, 0]);

describe("generateSvg", () => {
  it("produces valid SVG string", () => {
    const svg = generateSvg([makeSpectrum()], xScale, yScale, {
      width: 400,
      height: 300,
    });
    expect(svg).toContain('<?xml version="1.0"');
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("<path");
  });

  it("includes spectrum label as comment", () => {
    const svg = generateSvg(
      [makeSpectrum({ label: "My Spectrum" })],
      xScale,
      yScale,
      { width: 400, height: 300 },
    );
    expect(svg).toContain("<!-- My Spectrum -->");
  });

  it("includes title when provided", () => {
    const svg = generateSvg([makeSpectrum()], xScale, yScale, {
      width: 400,
      height: 300,
      title: "IR Spectrum",
    });
    expect(svg).toContain("IR Spectrum");
    expect(svg).toContain("<text");
  });

  it("skips invisible spectra", () => {
    const svg = generateSvg(
      [makeSpectrum({ visible: false })],
      xScale,
      yScale,
      { width: 400, height: 300 },
    );
    expect(svg).not.toContain("<path");
  });

  it("applies line style dash pattern", () => {
    const s = makeSpectrum() as Spectrum & { lineStyle: string };
    s.lineStyle = "dashed";
    const svg = generateSvg([s], xScale, yScale, {
      width: 400,
      height: 300,
    });
    expect(svg).toContain('stroke-dasharray="8 4"');
  });

  it("uses custom background color", () => {
    const svg = generateSvg([makeSpectrum()], xScale, yScale, {
      width: 400,
      height: 300,
      background: "#111827",
    });
    expect(svg).toContain('fill="#111827"');
  });
});

describe("LINE_DASH_PATTERNS", () => {
  it("has patterns for all supported styles", () => {
    expect(LINE_DASH_PATTERNS.solid).toBe("");
    expect(LINE_DASH_PATTERNS.dashed).toBe("8 4");
    expect(LINE_DASH_PATTERNS.dotted).toBe("2 2");
    expect(LINE_DASH_PATTERNS["dash-dot"]).toBe("8 4 2 4");
  });
});
