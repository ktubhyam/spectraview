/**
 * D3 scale factories for spectral axes.
 *
 * Handles reversed x-axis (standard for IR wavenumber display)
 * and automatic domain computation from spectral data.
 */

import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import type { Spectrum, Margin } from "../types";

/** Padding factor applied to y-axis domain (5% on each side). */
const Y_PADDING = 0.05;

/**
 * Compute the x-axis extent across all visible spectra.
 */
export function computeXExtent(spectra: Spectrum[]): [number, number] {
  let globalMin = Infinity;
  let globalMax = -Infinity;

  for (const s of spectra) {
    if (s.visible === false) continue;
    const [min, max] = extent(s.x as number[]) as [number, number];
    if (min < globalMin) globalMin = min;
    if (max > globalMax) globalMax = max;
  }

  if (!isFinite(globalMin)) return [0, 1];
  return [globalMin, globalMax];
}

/**
 * Compute the y-axis extent across all visible spectra with padding.
 */
export function computeYExtent(spectra: Spectrum[]): [number, number] {
  let globalMin = Infinity;
  let globalMax = -Infinity;

  for (const s of spectra) {
    if (s.visible === false) continue;
    const [min, max] = extent(s.y as number[]) as [number, number];
    if (min < globalMin) globalMin = min;
    if (max > globalMax) globalMax = max;
  }

  if (!isFinite(globalMin)) return [0, 1];

  const range = globalMax - globalMin;
  const pad = range * Y_PADDING;
  return [globalMin - pad, globalMax + pad];
}

/**
 * Create an x-axis scale.
 *
 * When `reverseX` is true, the domain is reversed so higher wavenumbers
 * appear on the left (standard IR convention).
 */
export function createXScale(
  domain: [number, number],
  width: number,
  margin: Margin,
  reverseX: boolean,
) {
  const plotWidth = width - margin.left - margin.right;
  const d = reverseX ? [domain[1], domain[0]] : domain;
  return scaleLinear().domain(d).range([0, plotWidth]);
}

/**
 * Create a y-axis scale (always low values at bottom, high at top).
 */
export function createYScale(
  domain: [number, number],
  height: number,
  margin: Margin,
) {
  const plotHeight = height - margin.top - margin.bottom;
  return scaleLinear().domain(domain).range([plotHeight, 0]);
}
