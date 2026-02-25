import { describe, it, expect } from "vitest";
import { lttbDownsample } from "../lttb";

const identity = (v: number) => v;

describe("lttbDownsample", () => {
  it("returns all points when count is under target", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [10, 20, 30, 40, 50];
    const result = lttbDownsample(x, y, 0, 5, identity, identity, 10);
    expect(result).toHaveLength(5);
  });

  it("preserves first and last points", () => {
    const x = Array.from({ length: 100 }, (_, i) => i);
    const y = Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.1));
    const result = lttbDownsample(x, y, 0, 100, identity, identity, 20);

    expect(result[0].index).toBe(0);
    expect(result[result.length - 1].index).toBe(99);
  });

  it("returns exactly targetCount points", () => {
    const x = Array.from({ length: 1000 }, (_, i) => i);
    const y = Array.from({ length: 1000 }, (_, i) => Math.sin(i * 0.01));
    const result = lttbDownsample(x, y, 0, 1000, identity, identity, 50);
    expect(result).toHaveLength(50);
  });

  it("respects startIdx and endIdx", () => {
    const x = Array.from({ length: 200 }, (_, i) => i);
    const y = Array.from({ length: 200 }, (_, i) => i * 2);
    const result = lttbDownsample(x, y, 50, 150, identity, identity, 20);

    // All indices should be within [50, 149]
    for (const point of result) {
      expect(point.index).toBeGreaterThanOrEqual(50);
      expect(point.index).toBeLessThan(150);
    }
  });

  it("applies scale functions to output coordinates", () => {
    const x = [0, 5, 10];
    const y = [0, 50, 100];
    const xScale = (v: number) => v * 10; // 0 → 0, 5 → 50, 10 → 100
    const yScale = (v: number) => 100 - v; // invert

    const result = lttbDownsample(x, y, 0, 3, xScale, yScale, 10);
    expect(result[0].px).toBe(0);
    expect(result[0].py).toBe(100);
    expect(result[2].px).toBe(100);
    expect(result[2].py).toBe(0);
  });

  it("preserves sharp peaks better than uniform sampling", () => {
    // Create data with a sharp spike at index 500
    const n = 1000;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = Array.from({ length: n }, (_, i) => (i === 500 ? 100 : 0));

    const result = lttbDownsample(x, y, 0, n, identity, identity, 30);

    // The spike should be preserved in the downsampled output
    const hasSpike = result.some((p) => p.py === 100);
    expect(hasSpike).toBe(true);
  });

  it("works with Float64Array", () => {
    const x = new Float64Array([1, 2, 3, 4, 5]);
    const y = new Float64Array([10, 20, 30, 40, 50]);
    const result = lttbDownsample(x, y, 0, 5, identity, identity, 10);
    expect(result).toHaveLength(5);
    expect(result[0].px).toBe(1);
  });
});
