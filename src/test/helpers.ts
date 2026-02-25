/**
 * Shared test factories for spectraview tests.
 */

import type { Spectrum, Peak, Region } from "../types";

/** Create a minimal test spectrum with synthetic IR data. */
export function createTestSpectrum(overrides: Partial<Spectrum> = {}): Spectrum {
  const n = 100;
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = 400 + (i / (n - 1)) * 3600; // 400–4000 cm⁻¹
    y[i] = Math.sin(i * 0.1) * 0.5 + 0.5;
  }
  return {
    id: "test-spectrum-1",
    label: "Test Spectrum",
    x,
    y,
    xUnit: "cm⁻¹",
    yUnit: "Absorbance",
    type: "IR",
    visible: true,
    ...overrides,
  };
}

/** Create a second test spectrum with different data. */
export function createTestSpectrum2(overrides: Partial<Spectrum> = {}): Spectrum {
  const n = 100;
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = 400 + (i / (n - 1)) * 3600;
    y[i] = Math.cos(i * 0.15) * 0.4 + 0.6;
  }
  return {
    id: "test-spectrum-2",
    label: "Test Spectrum 2",
    x,
    y,
    xUnit: "cm⁻¹",
    yUnit: "Absorbance",
    type: "IR",
    visible: true,
    ...overrides,
  };
}

/** Create sample peaks for testing. */
export function createTestPeaks(): Peak[] {
  return [
    { x: 1000, y: 0.8, label: "1000", spectrumId: "test-spectrum-1" },
    { x: 2000, y: 0.6, label: "2000", spectrumId: "test-spectrum-1" },
    { x: 3000, y: 0.9, label: "3000", spectrumId: "test-spectrum-1" },
  ];
}

/** Create sample regions for testing. */
export function createTestRegions(): Region[] {
  return [
    { xStart: 1500, xEnd: 1700, label: "Amide I" },
    { xStart: 2800, xEnd: 3000, label: "C-H stretch", color: "rgba(255, 0, 0, 0.2)" },
  ];
}
