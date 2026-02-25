/**
 * Spectrum comparison and mathematical operations.
 *
 * Provides functions for computing difference spectra, correlation
 * coefficients, spectral arithmetic, and residuals.
 *
 * All functions assume spectra share the same X-axis (same length
 * and point spacing). Use `interpolateToGrid` to align spectra
 * before comparison if needed.
 *
 * @module comparison
 */

import type { Spectrum } from "../types";

/** Auto-incrementing ID counter for generated spectra. */
let idCounter = 0;

/**
 * Compute the difference spectrum (a - b).
 *
 * @param a - First spectrum
 * @param b - Second spectrum
 * @returns New Spectrum representing a - b
 */
export function differenceSpectrum(a: Spectrum, b: Spectrum): Spectrum {
  const n = Math.min(a.y.length, b.y.length);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = (a.y[i] as number) - (b.y[i] as number);
  }

  return {
    id: `diff-${++idCounter}`,
    label: `${a.label} − ${b.label}`,
    x: a.x.length <= b.x.length ? new Float64Array(a.x) : new Float64Array(b.x),
    y,
    xUnit: a.xUnit,
    yUnit: a.yUnit,
    color: "#ef4444",
    type: a.type,
  };
}

/**
 * Add two spectra element-wise.
 */
export function addSpectra(a: Spectrum, b: Spectrum): Spectrum {
  const n = Math.min(a.y.length, b.y.length);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = (a.y[i] as number) + (b.y[i] as number);
  }

  return {
    id: `add-${++idCounter}`,
    label: `${a.label} + ${b.label}`,
    x: a.x.length <= b.x.length ? new Float64Array(a.x) : new Float64Array(b.x),
    y,
    xUnit: a.xUnit,
    yUnit: a.yUnit,
    type: a.type,
  };
}

/**
 * Multiply spectrum Y values by a scalar factor.
 */
export function scaleSpectrum(spectrum: Spectrum, factor: number): Spectrum {
  const n = spectrum.y.length;
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = (spectrum.y[i] as number) * factor;
  }

  return {
    id: `scaled-${++idCounter}`,
    label: `${spectrum.label} × ${factor}`,
    x: new Float64Array(spectrum.x),
    y,
    xUnit: spectrum.xUnit,
    yUnit: spectrum.yUnit,
    color: spectrum.color,
    type: spectrum.type,
  };
}

/**
 * Pearson correlation coefficient between two spectra's Y values.
 *
 * Returns a value in [-1, 1] where 1 means perfect positive
 * correlation and 0 means no linear correlation.
 */
export function correlationCoefficient(a: Spectrum, b: Spectrum): number {
  const n = Math.min(a.y.length, b.y.length);
  if (n === 0) return 0;

  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < n; i++) {
    sumA += a.y[i] as number;
    sumB += b.y[i] as number;
  }
  const meanA = sumA / n;
  const meanB = sumB / n;

  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < n; i++) {
    const da = (a.y[i] as number) - meanA;
    const db = (b.y[i] as number) - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }

  const denom = Math.sqrt(varA * varB);
  if (denom === 0) return 0;
  return cov / denom;
}

/**
 * Compute the residual (absolute difference) between two spectra.
 */
export function residualSpectrum(a: Spectrum, b: Spectrum): Spectrum {
  const n = Math.min(a.y.length, b.y.length);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = Math.abs((a.y[i] as number) - (b.y[i] as number));
  }

  return {
    id: `residual-${++idCounter}`,
    label: `|${a.label} − ${b.label}|`,
    x: a.x.length <= b.x.length ? new Float64Array(a.x) : new Float64Array(b.x),
    y,
    xUnit: a.xUnit,
    yUnit: a.yUnit,
    color: "#f97316",
    lineStyle: "dashed",
    type: a.type,
  };
}

/**
 * Interpolate a spectrum to a new X grid using linear interpolation.
 *
 * Useful for aligning two spectra that have different X-axis points
 * before performing comparison operations.
 *
 * @param spectrum - Source spectrum
 * @param newX - Target X values
 * @returns Spectrum interpolated to the new X grid
 */
export function interpolateToGrid(
  spectrum: Spectrum,
  newX: Float64Array | number[],
): Spectrum {
  const n = Math.min(spectrum.x.length, spectrum.y.length);
  const m = newX.length;
  const y = new Float64Array(m);

  if (n < 2) return { ...spectrum, x: new Float64Array(newX), y };

  // Determine direction of source x (ascending or descending)
  const ascending = (spectrum.x[n - 1] as number) > (spectrum.x[0] as number);

  for (let j = 0; j < m; j++) {
    const targetX = newX[j] as number;

    // Find bracketing indices using binary search
    let lo = 0;
    let hi = n - 1;

    while (lo < hi - 1) {
      const mid = (lo + hi) >>> 1;
      if (ascending) {
        if ((spectrum.x[mid] as number) <= targetX) lo = mid;
        else hi = mid;
      } else {
        if ((spectrum.x[mid] as number) >= targetX) lo = mid;
        else hi = mid;
      }
    }

    // Linear interpolation
    const x0 = spectrum.x[lo] as number;
    const x1 = spectrum.x[hi] as number;
    const y0 = spectrum.y[lo] as number;
    const y1 = spectrum.y[hi] as number;

    if (x0 === x1) {
      y[j] = y0;
    } else {
      const t = (targetX - x0) / (x1 - x0);
      y[j] = y0 + t * (y1 - y0);
    }
  }

  return {
    ...spectrum,
    id: `interp-${++idCounter}`,
    x: new Float64Array(newX),
    y,
  };
}
