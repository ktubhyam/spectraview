import { describe, it, expect } from "vitest";
import {
  baselineRubberBand,
  normalizeMinMax,
  normalizeArea,
  normalizeSNV,
  smoothSavitzkyGolay,
  derivative1st,
  derivative2nd,
} from "../processing";

describe("baselineRubberBand", () => {
  it("corrects a simple linear baseline with peaks above", () => {
    // Spectrum with a linear baseline + peak in the middle
    const y = [10, 11, 25, 13, 14]; // baseline is linear 10→14, peak at index 2
    const result = baselineRubberBand(y);
    // First and last points should be close to 0 (on the baseline)
    expect(Math.abs(result[0])).toBeLessThan(0.01);
    expect(Math.abs(result[4])).toBeLessThan(0.01);
    // Peak should be preserved above baseline
    expect(result[2]).toBeGreaterThan(10);
  });

  it("preserves peak above baseline", () => {
    const y = [0, 0, 10, 0, 0]; // single peak
    const result = baselineRubberBand(y);
    expect(result[2]).toBeGreaterThan(5); // peak remains
  });

  it("handles short arrays", () => {
    expect(baselineRubberBand([1, 2])).toHaveLength(2);
    expect(baselineRubberBand([1])).toHaveLength(1);
  });
});

describe("normalizeMinMax", () => {
  it("normalizes to [0, 1] range", () => {
    const y = [10, 20, 30, 40, 50];
    const result = normalizeMinMax(y);
    expect(result[0]).toBeCloseTo(0);
    expect(result[4]).toBeCloseTo(1);
    expect(result[2]).toBeCloseTo(0.5);
  });

  it("handles constant values", () => {
    const y = [5, 5, 5];
    const result = normalizeMinMax(y);
    for (const v of result) {
      expect(v).toBe(0);
    }
  });

  it("works with Float64Array", () => {
    const y = new Float64Array([0, 100]);
    const result = normalizeMinMax(y);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
  });
});

describe("normalizeArea", () => {
  it("produces unit area", () => {
    const x = [0, 1, 2, 3, 4];
    const y = [0, 1, 2, 1, 0]; // triangle-ish, area = 4
    const result = normalizeArea(x, y);

    // Recompute area
    let area = 0;
    for (let i = 1; i < x.length; i++) {
      area +=
        Math.abs(x[i] - x[i - 1]) *
        (Math.abs(result[i]) + Math.abs(result[i - 1])) *
        0.5;
    }
    expect(area).toBeCloseTo(1.0, 5);
  });

  it("handles empty/short arrays", () => {
    expect(normalizeArea([1], [2])).toHaveLength(1);
  });
});

describe("normalizeSNV", () => {
  it("produces zero mean", () => {
    const y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = normalizeSNV(y);

    let sum = 0;
    for (const v of result) sum += v;
    expect(sum / result.length).toBeCloseTo(0, 10);
  });

  it("produces unit standard deviation", () => {
    const y = [1, 2, 3, 4, 5];
    const result = normalizeSNV(y);

    let sum = 0;
    for (const v of result) sum += v;
    const mean = sum / result.length;

    let variance = 0;
    for (const v of result) variance += (v - mean) ** 2;
    const std = Math.sqrt(variance / result.length);
    expect(std).toBeCloseTo(1.0, 10);
  });

  it("handles empty array", () => {
    expect(normalizeSNV([])).toHaveLength(0);
  });
});

describe("smoothSavitzkyGolay", () => {
  it("reduces noise while preserving general shape", () => {
    // Noisy sine wave
    const n = 100;
    const y: number[] = [];
    for (let i = 0; i < n; i++) {
      y.push(Math.sin(i * 0.1) + (Math.random() - 0.5) * 0.3);
    }
    const smoothed = smoothSavitzkyGolay(y, 7);

    // Smoothed should have lower variance than original
    const originalVar = variance(y);
    const smoothedVar = variance(Array.from(smoothed));
    expect(smoothedVar).toBeLessThan(originalVar);
  });

  it("preserves array length", () => {
    const y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = smoothSavitzkyGolay(y, 5);
    expect(result).toHaveLength(10);
  });

  it("returns copy for arrays shorter than window", () => {
    const y = [1, 2, 3];
    const result = smoothSavitzkyGolay(y, 7);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(1);
  });
});

describe("derivative1st", () => {
  it("computes derivative of linear function", () => {
    const x = [0, 1, 2, 3, 4];
    const y = [0, 3, 6, 9, 12]; // slope = 3
    const result = derivative1st(x, y);

    for (const v of result) {
      expect(v).toBeCloseTo(3, 10);
    }
  });

  it("computes derivative of quadratic", () => {
    const x = [0, 1, 2, 3, 4];
    const y = [0, 1, 4, 9, 16]; // y = x²
    const result = derivative1st(x, y);

    // Interior points: dy/dx at x=1 → 2, x=2 → 4, x=3 → 6
    expect(result[1]).toBeCloseTo(2, 10);
    expect(result[2]).toBeCloseTo(4, 10);
    expect(result[3]).toBeCloseTo(6, 10);
  });
});

describe("derivative2nd", () => {
  it("computes second derivative of quadratic", () => {
    // y = x², d²y/dx² = 2
    const x = [0, 1, 2, 3, 4];
    const y = [0, 1, 4, 9, 16];
    const result = derivative2nd(x, y);

    // Interior points should be close to 2
    for (let i = 1; i < x.length - 1; i++) {
      expect(result[i]).toBeCloseTo(2, 5);
    }
  });

  it("handles short arrays", () => {
    expect(derivative2nd([1, 2], [1, 4])).toHaveLength(2);
  });
});

// Helper
function variance(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length;
}
