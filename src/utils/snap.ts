/**
 * Binary search utilities for snapping crosshair to nearest spectrum data.
 *
 * Given a cursor x-position, finds the closest data point on visible spectra
 * using binary search for O(log n) performance.
 */

import type { Spectrum } from "../types";

/** Result of a snap-to-spectrum search. */
export interface SnapResult {
  /** Spectrum ID of the closest match. */
  spectrumId: string;
  /** Index within the spectrum's data arrays. */
  index: number;
  /** Data-space x value of the snapped point. */
  x: number;
  /** Data-space y value of the snapped point. */
  y: number;
  /** Pixel distance from cursor to the snapped point. */
  distance: number;
}

/**
 * Binary search for the index of the closest x-value in a sorted array.
 *
 * Works with both ascending and descending arrays.
 * Returns the index of the element closest to `target`.
 */
export function binarySearchClosest(
  arr: Float64Array | number[],
  target: number,
  length: number,
): number {
  if (length === 0) return -1;
  if (length === 1) return 0;

  // Determine sort direction
  const ascending = (arr[length - 1] as number) >= (arr[0] as number);

  let lo = 0;
  let hi = length - 1;

  while (lo < hi - 1) {
    const mid = (lo + hi) >>> 1;
    const midVal = arr[mid] as number;

    if (ascending) {
      if (midVal <= target) lo = mid;
      else hi = mid;
    } else {
      if (midVal >= target) lo = mid;
      else hi = mid;
    }
  }

  // Compare lo and hi to find closest
  const dLo = Math.abs((arr[lo] as number) - target);
  const dHi = Math.abs((arr[hi] as number) - target);
  return dLo <= dHi ? lo : hi;
}

/**
 * Find the nearest data point across all visible spectra to a given
 * data-space x position. Uses pixel-space distance for ranking.
 */
export function snapToNearestSpectrum(
  spectra: Spectrum[],
  dataX: number,
  cursorPy: number,
  xScale: (v: number) => number,
  yScale: (v: number) => number,
): SnapResult | null {
  let best: SnapResult | null = null;

  for (const spectrum of spectra) {
    if (spectrum.visible === false) continue;

    const n = Math.min(spectrum.x.length, spectrum.y.length);
    if (n < 2) continue;

    const idx = binarySearchClosest(spectrum.x, dataX, n);
    if (idx < 0) continue;

    const sx = spectrum.x[idx] as number;
    const sy = spectrum.y[idx] as number;

    // Compute pixel distance (primarily y-axis since x is at cursor)
    const pxDist = Math.abs(xScale(sx) - xScale(dataX));
    const pyDist = Math.abs(yScale(sy) - cursorPy);
    const distance = Math.sqrt(pxDist * pxDist + pyDist * pyDist);

    if (!best || distance < best.distance) {
      best = {
        spectrumId: spectrum.id,
        index: idx,
        x: sx,
        y: sy,
        distance,
      };
    }
  }

  return best;
}
