/**
 * Shared synthetic data for Storybook stories.
 *
 * Generates realistic IR spectra with Gaussian peaks
 * at common functional group frequencies.
 */

import type { Spectrum, Peak, Region } from "../types";

/** Generate a Gaussian peak centered at `center` with given `width` and `height`. */
function gaussian(x: number, center: number, width: number, height: number): number {
  return height * Math.exp(-0.5 * ((x - center) / width) ** 2);
}

/** Create a synthetic IR spectrum with common absorption bands. */
export function createIRSpectrum(overrides: Partial<Spectrum> = {}): Spectrum {
  const n = 500;
  const x = new Float64Array(n);
  const y = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    x[i] = 400 + (i / (n - 1)) * 3600; // 400–4000 cm⁻¹

    // Baseline + peaks at common IR frequencies
    y[i] =
      0.05 +
      gaussian(x[i], 1000, 30, 0.6) + // C-O stretch
      gaussian(x[i], 1700, 40, 0.85) + // C=O stretch
      gaussian(x[i], 2900, 60, 0.4) + // C-H stretch
      gaussian(x[i], 3400, 120, 0.7); // O-H stretch
  }

  return {
    id: "ir-ethanol",
    label: "Ethanol (IR)",
    x,
    y,
    xUnit: "cm⁻¹",
    yUnit: "Absorbance",
    type: "IR",
    visible: true,
    ...overrides,
  };
}

/** Create a second synthetic spectrum (acetone). */
export function createSecondSpectrum(overrides: Partial<Spectrum> = {}): Spectrum {
  const n = 500;
  const x = new Float64Array(n);
  const y = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    x[i] = 400 + (i / (n - 1)) * 3600;

    y[i] =
      0.03 +
      gaussian(x[i], 1220, 25, 0.45) + // C-C stretch
      gaussian(x[i], 1720, 35, 0.95) + // C=O stretch (ketone)
      gaussian(x[i], 2960, 50, 0.35) + // C-H stretch
      gaussian(x[i], 3000, 40, 0.25); // C-H stretch
  }

  return {
    id: "ir-acetone",
    label: "Acetone (IR)",
    x,
    y,
    xUnit: "cm⁻¹",
    yUnit: "Absorbance",
    type: "IR",
    visible: true,
    ...overrides,
  };
}

/** Sample peaks for IR spectrum. */
export const samplePeaks: Peak[] = [
  { x: 1000, y: 0.65, label: "1000", spectrumId: "ir-ethanol" },
  { x: 1700, y: 0.9, label: "1700", spectrumId: "ir-ethanol" },
  { x: 2900, y: 0.45, label: "2900", spectrumId: "ir-ethanol" },
  { x: 3400, y: 0.75, label: "3400", spectrumId: "ir-ethanol" },
];

/** Sample regions for IR spectrum. */
export const sampleRegions: Region[] = [
  { xStart: 1650, xEnd: 1750, label: "C=O stretch" },
  { xStart: 2800, xEnd: 3100, label: "C-H stretch", color: "rgba(220, 38, 38, 0.15)" },
  { xStart: 3200, xEnd: 3600, label: "O-H stretch", color: "rgba(22, 163, 74, 0.15)" },
];
