import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNormalization } from "../useNormalization";
import type { Spectrum } from "../../types";

const spectrum: Spectrum = {
  id: "s1",
  label: "Test",
  x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  y: [10, 20, 50, 80, 100, 90, 60, 30, 15, 10],
};

describe("useNormalization", () => {
  it("returns unchanged spectra in 'none' mode", () => {
    const { result } = renderHook(() =>
      useNormalization({ spectra: [spectrum], mode: "none" }),
    );
    expect(result.current.spectra[0].y).toBe(spectrum.y);
    expect(result.current.modeLabel).toBe("Raw");
  });

  it("normalizes to [0,1] in 'min-max' mode", () => {
    const { result } = renderHook(() =>
      useNormalization({ spectra: [spectrum], mode: "min-max" }),
    );
    const y = result.current.spectra[0].y;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < y.length; i++) {
      if ((y[i] as number) < min) min = y[i] as number;
      if ((y[i] as number) > max) max = y[i] as number;
    }
    expect(min).toBeCloseTo(0);
    expect(max).toBeCloseTo(1);
  });

  it("applies SNV normalization", () => {
    const { result } = renderHook(() =>
      useNormalization({ spectra: [spectrum], mode: "snv" }),
    );
    const y = result.current.spectra[0].y;
    // SNV produces zero mean
    let sum = 0;
    for (let i = 0; i < y.length; i++) sum += y[i] as number;
    expect(sum / y.length).toBeCloseTo(0, 10);
  });

  it("applies baseline correction", () => {
    const { result } = renderHook(() =>
      useNormalization({ spectra: [spectrum], mode: "baseline" }),
    );
    const y = result.current.spectra[0].y;
    expect(y).toHaveLength(spectrum.y.length);
    expect(result.current.modeLabel).toBe("Baseline Corrected");
  });

  it("applies smoothing", () => {
    const { result } = renderHook(() =>
      useNormalization({ spectra: [spectrum], mode: "smooth", smoothWindow: 5 }),
    );
    expect(result.current.spectra[0].y).toHaveLength(spectrum.y.length);
    expect(result.current.modeLabel).toBe("Smoothed");
  });

  it("computes derivative", () => {
    const { result } = renderHook(() =>
      useNormalization({ spectra: [spectrum], mode: "derivative" }),
    );
    expect(result.current.spectra[0].y).toHaveLength(spectrum.y.length);
    expect(result.current.modeLabel).toBe("1st Derivative");
  });

  it("preserves spectrum metadata", () => {
    const sp: Spectrum = { ...spectrum, xUnit: "cm⁻¹", color: "#ff0000" };
    const { result } = renderHook(() =>
      useNormalization({ spectra: [sp], mode: "min-max" }),
    );
    expect(result.current.spectra[0].xUnit).toBe("cm⁻¹");
    expect(result.current.spectra[0].color).toBe("#ff0000");
    expect(result.current.spectra[0].id).toBe("s1");
  });
});
