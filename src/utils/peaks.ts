/**
 * Peak detection for spectral data.
 *
 * Uses a simple local-maxima algorithm with prominence filtering,
 * suitable for identifying peaks in IR, Raman, and NIR spectra.
 */

import type { Peak } from "../types";

/** Default minimum prominence for peak detection. */
const DEFAULT_PROMINENCE = 0.01;

/** Default minimum distance between peaks (in number of points). */
const DEFAULT_MIN_DISTANCE = 5;

export interface PeakDetectionOptions {
  /** Minimum prominence relative to the signal range. */
  prominence?: number;
  /** Minimum distance between peaks in data points. */
  minDistance?: number;
  /** Maximum number of peaks to return (sorted by prominence). */
  maxPeaks?: number;
}

/**
 * Detect peaks in a 1D signal using local maxima with prominence filtering.
 *
 * @param x - X-axis values (wavenumbers, wavelengths, etc.)
 * @param y - Y-axis values (absorbance, intensity, etc.)
 * @param options - Detection parameters
 * @returns Array of detected peaks sorted by x position
 */
export function detectPeaks(
  x: Float64Array | number[],
  y: Float64Array | number[],
  options: PeakDetectionOptions = {},
): Peak[] {
  const {
    prominence = DEFAULT_PROMINENCE,
    minDistance = DEFAULT_MIN_DISTANCE,
    maxPeaks,
  } = options;

  if (x.length < 3 || y.length < 3) return [];

  // Find the signal range for prominence scaling
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i < y.length; i++) {
    if (y[i] < yMin) yMin = y[i];
    if (y[i] > yMax) yMax = y[i];
  }
  const signalRange = yMax - yMin;
  if (signalRange === 0) return [];

  const absProminence = prominence * signalRange;

  // Find local maxima
  const candidates: { index: number; prom: number }[] = [];
  for (let i = 1; i < y.length - 1; i++) {
    if (y[i] > y[i - 1] && y[i] > y[i + 1]) {
      // Compute prominence: min drop to each side before a higher peak
      const leftMin = findMinBefore(y, i);
      const rightMin = findMinAfter(y, i);
      const prom = y[i] - Math.max(leftMin, rightMin);

      if (prom >= absProminence) {
        candidates.push({ index: i, prom });
      }
    }
  }

  // Sort by prominence (highest first) for distance filtering
  candidates.sort((a, b) => b.prom - a.prom);

  // Filter by minimum distance (keep most prominent first)
  const kept: { index: number; prom: number }[] = [];
  for (const c of candidates) {
    const tooClose = kept.some(
      (k) => Math.abs(k.index - c.index) < minDistance,
    );
    if (!tooClose) {
      kept.push(c);
    }
  }

  // Apply max peaks limit
  const selected = maxPeaks ? kept.slice(0, maxPeaks) : kept;

  // Convert to Peak objects, sorted by x position
  return selected
    .map((c) => ({
      x: x[c.index] as number,
      y: y[c.index] as number,
      label: formatWavenumber(x[c.index] as number),
    }))
    .sort((a, b) => a.x - b.x);
}

/**
 * Find the minimum value in y before index i, stopping at a higher peak.
 */
function findMinBefore(y: Float64Array | number[], i: number): number {
  let min = y[i] as number;
  for (let j = i - 1; j >= 0; j--) {
    if (y[j] > y[i]) break;
    if ((y[j] as number) < min) min = y[j] as number;
  }
  return min;
}

/**
 * Find the minimum value in y after index i, stopping at a higher peak.
 */
function findMinAfter(y: Float64Array | number[], i: number): number {
  let min = y[i] as number;
  for (let j = i + 1; j < y.length; j++) {
    if (y[j] > y[i]) break;
    if ((y[j] as number) < min) min = y[j] as number;
  }
  return min;
}

/**
 * Format a wavenumber value for display as a peak label.
 */
function formatWavenumber(value: number): string {
  return Math.round(value).toString();
}
