import { describe, it, expect } from "vitest";
import {
  differenceSpectrum,
  addSpectra,
  scaleSpectrum,
  correlationCoefficient,
  residualSpectrum,
  interpolateToGrid,
} from "../comparison";
import type { Spectrum } from "../../types";

function makeSpectrum(
  id: string,
  x: number[],
  y: number[],
): Spectrum {
  return { id, label: id, x, y };
}

const a = makeSpectrum("a", [1, 2, 3, 4, 5], [10, 20, 30, 40, 50]);
const b = makeSpectrum("b", [1, 2, 3, 4, 5], [5, 10, 15, 20, 25]);

describe("differenceSpectrum", () => {
  it("computes element-wise difference", () => {
    const diff = differenceSpectrum(a, b);
    expect(diff.y[0]).toBe(5);
    expect(diff.y[2]).toBe(15);
    expect(diff.y[4]).toBe(25);
  });

  it("sets label and color", () => {
    const diff = differenceSpectrum(a, b);
    expect(diff.label).toContain("a");
    expect(diff.label).toContain("b");
    expect(diff.color).toBe("#ef4444");
  });
});

describe("addSpectra", () => {
  it("computes element-wise sum", () => {
    const sum = addSpectra(a, b);
    expect(sum.y[0]).toBe(15);
    expect(sum.y[2]).toBe(45);
    expect(sum.y[4]).toBe(75);
  });
});

describe("scaleSpectrum", () => {
  it("multiplies Y by scalar", () => {
    const scaled = scaleSpectrum(a, 2);
    expect(scaled.y[0]).toBe(20);
    expect(scaled.y[4]).toBe(100);
  });

  it("handles negative factor", () => {
    const scaled = scaleSpectrum(a, -1);
    expect(scaled.y[0]).toBe(-10);
  });
});

describe("correlationCoefficient", () => {
  it("returns 1 for perfectly correlated spectra", () => {
    const r = correlationCoefficient(a, b);
    expect(r).toBeCloseTo(1.0, 10);
  });

  it("returns -1 for anti-correlated spectra", () => {
    const inverted = makeSpectrum("inv", [1, 2, 3, 4, 5], [50, 40, 30, 20, 10]);
    const r = correlationCoefficient(a, inverted);
    expect(r).toBeCloseTo(-1.0, 10);
  });

  it("returns 0 for empty spectra", () => {
    const empty = makeSpectrum("e", [], []);
    expect(correlationCoefficient(empty, empty)).toBe(0);
  });
});

describe("residualSpectrum", () => {
  it("computes absolute difference", () => {
    const c = makeSpectrum("c", [1, 2, 3], [10, 5, 20]);
    const d = makeSpectrum("d", [1, 2, 3], [15, 10, 10]);
    const res = residualSpectrum(c, d);
    expect(res.y[0]).toBe(5);
    expect(res.y[1]).toBe(5);
    expect(res.y[2]).toBe(10);
  });

  it("uses dashed line style", () => {
    const res = residualSpectrum(a, b);
    expect(res.lineStyle).toBe("dashed");
  });
});

describe("interpolateToGrid", () => {
  it("interpolates to new X grid", () => {
    const sp = makeSpectrum("sp", [0, 10, 20, 30], [0, 100, 200, 300]);
    const newX = [5, 15, 25];
    const result = interpolateToGrid(sp, newX);

    expect(result.y[0]).toBeCloseTo(50, 5); // midpoint 0→100
    expect(result.y[1]).toBeCloseTo(150, 5);
    expect(result.y[2]).toBeCloseTo(250, 5);
  });

  it("preserves metadata", () => {
    const sp: Spectrum = {
      id: "sp",
      label: "Test",
      x: [0, 10],
      y: [0, 100],
      xUnit: "cm⁻¹",
      yUnit: "Abs",
    };
    const result = interpolateToGrid(sp, [5]);
    expect(result.xUnit).toBe("cm⁻¹");
    expect(result.label).toBe("Test");
  });

  it("handles descending X (IR wavenumber)", () => {
    const sp = makeSpectrum("sp", [4000, 3000, 2000, 1000], [0, 50, 100, 200]);
    const newX = [3500, 2500, 1500];
    const result = interpolateToGrid(sp, newX);

    expect(result.y[0]).toBeCloseTo(25, 0); // between 0 and 50
    expect(result.y[1]).toBeCloseTo(75, 0); // between 50 and 100
    expect(result.y[2]).toBeCloseTo(150, 0); // between 100 and 200
  });
});
