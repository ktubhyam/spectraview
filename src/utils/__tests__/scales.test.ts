import { describe, it, expect } from "vitest";
import {
  computeXExtent,
  computeYExtent,
  createXScale,
  createYScale,
} from "../scales";
import type { Spectrum, Margin } from "../../types";

const makeSpectrum = (x: number[], y: number[], visible = true): Spectrum => ({
  id: "test",
  label: "Test",
  x: new Float64Array(x),
  y: new Float64Array(y),
  visible,
});

const margin: Margin = { top: 10, right: 10, bottom: 40, left: 50 };

describe("computeXExtent", () => {
  it("computes extent across a single spectrum", () => {
    const spectra = [makeSpectrum([100, 200, 300], [1, 2, 3])];
    const [min, max] = computeXExtent(spectra);
    expect(min).toBe(100);
    expect(max).toBe(300);
  });

  it("computes global extent across multiple spectra", () => {
    const spectra = [
      makeSpectrum([100, 200], [1, 2]),
      makeSpectrum([50, 350], [1, 2]),
    ];
    const [min, max] = computeXExtent(spectra);
    expect(min).toBe(50);
    expect(max).toBe(350);
  });

  it("ignores invisible spectra", () => {
    const spectra = [
      makeSpectrum([100, 200], [1, 2]),
      makeSpectrum([0, 500], [1, 2], false),
    ];
    const [min, max] = computeXExtent(spectra);
    expect(min).toBe(100);
    expect(max).toBe(200);
  });

  it("returns [0, 1] for empty input", () => {
    const [min, max] = computeXExtent([]);
    expect(min).toBe(0);
    expect(max).toBe(1);
  });
});

describe("computeYExtent", () => {
  it("computes extent with padding", () => {
    const spectra = [makeSpectrum([1, 2, 3], [0, 10, 5])];
    const [min, max] = computeYExtent(spectra);
    // 5% padding on each side of [0, 10]
    expect(min).toBeCloseTo(-0.5);
    expect(max).toBeCloseTo(10.5);
  });
});

describe("createXScale", () => {
  it("creates a normal linear scale", () => {
    const scale = createXScale([0, 100], 800, margin, false);
    expect(scale(0)).toBe(0);
    expect(scale(100)).toBe(740); // 800 - 50 - 10
  });

  it("creates a reversed scale for IR", () => {
    const scale = createXScale([400, 4000], 800, margin, true);
    // With reverseX, 4000 maps to 0 and 400 maps to plotWidth
    expect(scale(4000)).toBe(0);
    expect(scale(400)).toBe(740);
  });
});

describe("createYScale", () => {
  it("maps low values to bottom and high to top", () => {
    const scale = createYScale([0, 1], 400, margin);
    // plotHeight = 400 - 10 - 40 = 350
    expect(scale(0)).toBe(350); // bottom
    expect(scale(1)).toBe(0); // top
  });
});
