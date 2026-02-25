import { describe, it, expect } from "vitest";
import { detectPeaks } from "../peaks";

describe("detectPeaks", () => {
  it("detects simple peaks", () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const y = [0, 1, 0, 0, 2, 0, 0, 0.5, 0];
    const peaks = detectPeaks(x, y, { prominence: 0.1, minDistance: 1 });

    expect(peaks.length).toBeGreaterThanOrEqual(2);
    const peakXs = peaks.map((p) => p.x);
    expect(peakXs).toContain(2);
    expect(peakXs).toContain(5);
  });

  it("respects minDistance", () => {
    // Two peaks very close together
    const x = [1, 2, 3, 4, 5, 6, 7];
    const y = [0, 1, 0.5, 1.2, 0, 0, 0];
    const peaks = detectPeaks(x, y, { prominence: 0.1, minDistance: 3 });

    // Should keep only the most prominent one
    expect(peaks.length).toBe(1);
    expect(peaks[0].x).toBe(4); // Higher peak
  });

  it("respects maxPeaks", () => {
    const x = Array.from({ length: 100 }, (_, i) => i);
    const y = x.map((v) => Math.sin(v * 0.5) * Math.sin(v * 0.1));
    const peaks = detectPeaks(x, y, { prominence: 0.01, maxPeaks: 3 });

    expect(peaks.length).toBeLessThanOrEqual(3);
  });

  it("returns empty for flat signal", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [1, 1, 1, 1, 1];
    const peaks = detectPeaks(x, y);

    expect(peaks.length).toBe(0);
  });

  it("returns empty for too-short arrays", () => {
    expect(detectPeaks([1], [1])).toHaveLength(0);
    expect(detectPeaks([1, 2], [1, 2])).toHaveLength(0);
  });

  it("generates wavenumber labels", () => {
    const x = [1000, 2000, 3000, 4000, 5000];
    const y = [0, 5, 0, 3, 0];
    const peaks = detectPeaks(x, y, { prominence: 0.1 });

    expect(peaks[0].label).toBe("2000");
  });

  it("sorts peaks by x position", () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const y = [0, 0.5, 0, 0, 2, 0, 0, 1, 0];
    const peaks = detectPeaks(x, y, { prominence: 0.1, minDistance: 1 });

    for (let i = 1; i < peaks.length; i++) {
      expect(peaks[i].x).toBeGreaterThan(peaks[i - 1].x);
    }
  });

  it("works with Float64Array input", () => {
    const x = new Float64Array([100, 200, 300, 400, 500]);
    const y = new Float64Array([0, 1, 0, 0.5, 0]);
    const peaks = detectPeaks(x, y, { prominence: 0.1 });

    expect(peaks.length).toBeGreaterThanOrEqual(1);
    expect(peaks[0].x).toBe(200);
  });
});
