import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePeakPicking } from "../usePeakPicking";
import { createTestSpectrum, createTestSpectrum2 } from "../../test/helpers";
import type { Spectrum } from "../../types";

/**
 * Create a spectrum with clear, well-separated peaks suitable for detection.
 * Generates a signal with distinct Gaussian peaks at known positions.
 */
function createPeakySpectrum(
  id: string,
  overrides: Partial<Spectrum> = {},
): Spectrum {
  const n = 200;
  const x = new Float64Array(n);
  const y = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    x[i] = 400 + (i / (n - 1)) * 3600; // 400-4000 cm^-1
    // Baseline with two strong Gaussian peaks
    const center1 = 1500;
    const center2 = 3000;
    const sigma = 80;
    const dx1 = x[i] - center1;
    const dx2 = x[i] - center2;
    y[i] = 0.1 + Math.exp(-(dx1 * dx1) / (2 * sigma * sigma))
               + 0.7 * Math.exp(-(dx2 * dx2) / (2 * sigma * sigma));
  }

  return {
    id,
    label: `Peaky ${id}`,
    x,
    y,
    xUnit: "cm\u207B\u00B9",
    yUnit: "Absorbance",
    type: "IR",
    visible: true,
    ...overrides,
  };
}

describe("usePeakPicking", () => {
  it("returns empty array when disabled", () => {
    const spectra = [createPeakySpectrum("s1")];
    const { result } = renderHook(() =>
      usePeakPicking(spectra, { enabled: false }),
    );

    expect(result.current).toEqual([]);
  });

  it("detects peaks in provided spectra", () => {
    const spectra = [createPeakySpectrum("s1")];
    const { result } = renderHook(() =>
      usePeakPicking(spectra, { prominence: 0.1, minDistance: 5 }),
    );

    expect(result.current.length).toBeGreaterThanOrEqual(1);
    // Every returned peak should have x and y numeric values
    for (const peak of result.current) {
      expect(typeof peak.x).toBe("number");
      expect(typeof peak.y).toBe("number");
    }
  });

  it("respects spectrumIds filter", () => {
    const s1 = createPeakySpectrum("s1");
    const s2 = createPeakySpectrum("s2");
    const spectra = [s1, s2];

    const { result } = renderHook(() =>
      usePeakPicking(spectra, { spectrumIds: ["s2"], prominence: 0.1 }),
    );

    // All returned peaks should belong to s2
    for (const peak of result.current) {
      expect(peak.spectrumId).toBe("s2");
    }
    // Confirm we actually got some peaks
    expect(result.current.length).toBeGreaterThanOrEqual(1);
  });

  it("skips hidden spectra", () => {
    const visible = createPeakySpectrum("visible", { visible: true });
    const hidden = createPeakySpectrum("hidden", { visible: false });
    const spectra = [visible, hidden];

    const { result } = renderHook(() =>
      usePeakPicking(spectra, { prominence: 0.1 }),
    );

    // No peaks from the hidden spectrum
    const hiddenPeaks = result.current.filter(
      (p) => p.spectrumId === "hidden",
    );
    expect(hiddenPeaks).toHaveLength(0);

    // Should still have peaks from the visible spectrum
    const visiblePeaks = result.current.filter(
      (p) => p.spectrumId === "visible",
    );
    expect(visiblePeaks.length).toBeGreaterThanOrEqual(1);
  });

  it("includes spectrumId in returned peaks", () => {
    const spectra = [createPeakySpectrum("my-spectrum")];
    const { result } = renderHook(() =>
      usePeakPicking(spectra, { prominence: 0.1 }),
    );

    expect(result.current.length).toBeGreaterThanOrEqual(1);
    for (const peak of result.current) {
      expect(peak.spectrumId).toBe("my-spectrum");
    }
  });

  it("responds to prominence option", () => {
    const spectra = [createPeakySpectrum("s1")];

    // Low prominence should find more peaks
    const { result: lowProm } = renderHook(() =>
      usePeakPicking(spectra, { prominence: 0.01, minDistance: 1 }),
    );

    // Very high prominence should find fewer (or zero) peaks
    const { result: highProm } = renderHook(() =>
      usePeakPicking(spectra, { prominence: 0.99, minDistance: 1 }),
    );

    expect(lowProm.current.length).toBeGreaterThanOrEqual(
      highProm.current.length,
    );
  });
});
