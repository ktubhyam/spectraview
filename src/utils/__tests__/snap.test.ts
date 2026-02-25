import { describe, it, expect } from "vitest";
import { binarySearchClosest, snapToNearestSpectrum } from "../snap";
import type { Spectrum } from "../../types";

describe("binarySearchClosest", () => {
  it("finds exact match in ascending array", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(binarySearchClosest(arr, 3, arr.length)).toBe(2);
  });

  it("finds closest in ascending array", () => {
    const arr = [1, 3, 5, 7, 9];
    expect(binarySearchClosest(arr, 4, arr.length)).toBe(1); // 3 is closer to 4 than 5
  });

  it("finds closest in descending array (IR wavenumber order)", () => {
    const arr = [4000, 3000, 2000, 1000, 500];
    // 2500 is equidistant from 3000 and 2000; algorithm favors lower index
    const idx = binarySearchClosest(arr, 2500, arr.length);
    expect(idx === 1 || idx === 2).toBe(true);
    // Test non-equidistant case
    expect(binarySearchClosest(arr, 2100, arr.length)).toBe(2); // 2000 is closer
  });

  it("returns 0 for single element", () => {
    expect(binarySearchClosest([42], 100, 1)).toBe(0);
  });

  it("returns -1 for empty array", () => {
    expect(binarySearchClosest([], 1, 0)).toBe(-1);
  });

  it("handles target before range", () => {
    const arr = [10, 20, 30];
    expect(binarySearchClosest(arr, 5, arr.length)).toBe(0);
  });

  it("handles target after range", () => {
    const arr = [10, 20, 30];
    expect(binarySearchClosest(arr, 35, arr.length)).toBe(2);
  });

  it("works with Float64Array", () => {
    const arr = new Float64Array([1.1, 2.2, 3.3, 4.4]);
    expect(binarySearchClosest(arr, 3.0, arr.length)).toBe(2); // 3.3 is closest
  });
});

describe("snapToNearestSpectrum", () => {
  const makeSpectrum = (id: string, x: number[], y: number[]): Spectrum => ({
    id,
    label: id,
    x,
    y,
  });

  const linearScale = (domain: [number, number], range: [number, number]) => {
    const m = (range[1] - range[0]) / (domain[1] - domain[0]);
    const b = range[0] - m * domain[0];
    const fn = (v: number) => m * v + b;
    return fn;
  };

  it("returns null for empty spectra", () => {
    const result = snapToNearestSpectrum([], 5, 100, (v) => v, (v) => v);
    expect(result).toBeNull();
  });

  it("snaps to nearest point on single spectrum", () => {
    const sp = makeSpectrum("s1", [1, 2, 3, 4, 5], [10, 20, 30, 40, 50]);
    const xScale = linearScale([0, 10], [0, 100]);
    const yScale = linearScale([0, 100], [100, 0]); // inverted y

    const result = snapToNearestSpectrum([sp], 2.8, yScale(30), xScale, yScale);
    expect(result).not.toBeNull();
    expect(result!.x).toBe(3);
    expect(result!.y).toBe(30);
    expect(result!.spectrumId).toBe("s1");
  });

  it("skips invisible spectra", () => {
    const sp = makeSpectrum("s1", [1, 2, 3], [10, 20, 30]);
    sp.visible = false;
    const result = snapToNearestSpectrum([sp], 2, 50, (v) => v, (v) => v);
    expect(result).toBeNull();
  });

  it("selects closer spectrum when multiple exist", () => {
    const sp1 = makeSpectrum("s1", [1, 2, 3], [100, 200, 300]);
    const sp2 = makeSpectrum("s2", [1, 2, 3], [10, 20, 30]);
    const xScale = linearScale([0, 5], [0, 500]);
    const yScale = linearScale([0, 400], [400, 0]);

    // Cursor near sp2's y-values
    const result = snapToNearestSpectrum([sp1, sp2], 2, yScale(25), xScale, yScale);
    expect(result).not.toBeNull();
    expect(result!.spectrumId).toBe("s2");
  });
});
