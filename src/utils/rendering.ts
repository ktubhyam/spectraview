/**
 * Canvas 2D rendering utilities for drawing spectral lines.
 *
 * Canvas is used for the data-heavy spectral line rendering (10K+ points)
 * while SVG handles axes, annotations, and interactive overlays.
 */

import type { ScaleLinear } from "d3-scale";
import type { Spectrum } from "../types";
import { getSpectrumColor } from "./colors";

/** Line width for spectrum rendering. */
const LINE_WIDTH = 1.5;

/** Line width when a spectrum is highlighted/hovered. */
const HIGHLIGHT_LINE_WIDTH = 2.5;

/**
 * Threshold: if visible points exceed this count, apply min-max decimation.
 * Each pixel bin keeps up to 4 values (first, min, max, last) so we
 * draw at most plotWidth * 4 points — plenty of visual fidelity.
 */
const DECIMATION_THRESHOLD = 2000;

/**
 * Clear the canvas and set up for drawing.
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Min-max decimation: group visible points into pixel-width bins and keep
 * first/min/max/last per bin. This preserves visual shape while reducing
 * path complexity from O(N) to O(pixelWidth).
 */
function decimateMinMax(
  x: Float64Array | number[],
  y: Float64Array | number[],
  startIdx: number,
  endIdx: number,
  xScale: ScaleLinear<number, number>,
  yScale: ScaleLinear<number, number>,
  plotWidth: number,
): Array<{ px: number; py: number }> {
  const numBins = Math.max(Math.ceil(plotWidth), 1);
  const rangeMin = xScale.range()[0] as number;
  const rangeMax = xScale.range()[1] as number;
  const rangeSpan = Math.abs(rangeMax - rangeMin);

  // Build bins
  const bins: Array<{
    minY: number;
    maxY: number;
    minYIdx: number;
    maxYIdx: number;
    firstIdx: number;
    lastIdx: number;
    count: number;
  }> = Array.from({ length: numBins }, () => ({
    minY: Infinity,
    maxY: -Infinity,
    minYIdx: -1,
    maxYIdx: -1,
    firstIdx: -1,
    lastIdx: -1,
    count: 0,
  }));

  for (let i = startIdx; i < endIdx; i++) {
    const px = xScale(x[i] as number);
    const bin = Math.min(
      Math.max(Math.floor(((px - Math.min(rangeMin, rangeMax)) / rangeSpan) * numBins), 0),
      numBins - 1,
    );

    const yVal = y[i] as number;
    const b = bins[bin];
    if (b.count === 0) b.firstIdx = i;
    b.lastIdx = i;
    if (yVal < b.minY) {
      b.minY = yVal;
      b.minYIdx = i;
    }
    if (yVal > b.maxY) {
      b.maxY = yVal;
      b.maxYIdx = i;
    }
    b.count++;
  }

  // Flatten bins into points (first, min, max, last — in index order)
  const points: Array<{ px: number; py: number }> = [];

  for (const b of bins) {
    if (b.count === 0) continue;
    if (b.count === 1) {
      points.push({ px: xScale(x[b.firstIdx] as number), py: yScale(y[b.firstIdx] as number) });
      continue;
    }

    // Collect unique indices in original order
    const indices = [b.firstIdx, b.minYIdx, b.maxYIdx, b.lastIdx];
    const unique = [...new Set(indices)].sort((a, c) => a - c);

    for (const idx of unique) {
      points.push({ px: xScale(x[idx] as number), py: yScale(y[idx] as number) });
    }
  }

  return points;
}

/**
 * Draw a single spectrum as a line path on the canvas.
 *
 * Uses beginPath/lineTo for maximum performance with large point counts.
 * Applies min-max decimation when point count exceeds DECIMATION_THRESHOLD.
 */
export function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  spectrum: Spectrum,
  index: number,
  xScale: ScaleLinear<number, number>,
  yScale: ScaleLinear<number, number>,
  plotWidth: number,
  options?: {
    highlighted?: boolean;
    opacity?: number;
  },
): void {
  const { highlighted = false, opacity = 1.0 } = options ?? {};
  const n = Math.min(spectrum.x.length, spectrum.y.length);
  if (n < 2) return;

  const color = spectrum.color ?? getSpectrumColor(index);
  const lineWidth = highlighted ? HIGHLIGHT_LINE_WIDTH : LINE_WIDTH;

  // Get visible x-domain for culling
  const [xMin, xMax] = xScale.domain() as [number, number];
  const domainMin = Math.min(xMin, xMax);
  const domainMax = Math.max(xMin, xMax);

  // Find range of visible indices (with 1-point margin for continuity)
  let startIdx = 0;
  let endIdx = n;
  for (let i = 0; i < n; i++) {
    if ((spectrum.x[i] as number) >= domainMin || (i < n - 1 && (spectrum.x[i + 1] as number) >= domainMin)) {
      startIdx = Math.max(0, i - 1);
      break;
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    if ((spectrum.x[i] as number) <= domainMax || (i > 0 && (spectrum.x[i - 1] as number) <= domainMax)) {
      endIdx = Math.min(n, i + 2);
      break;
    }
  }

  const visibleCount = endIdx - startIdx;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = opacity;
  ctx.lineJoin = "round";

  if (visibleCount > DECIMATION_THRESHOLD) {
    // Decimated path: min-max binning
    const points = decimateMinMax(spectrum.x, spectrum.y, startIdx, endIdx, xScale, yScale, plotWidth);
    if (points.length > 0) {
      ctx.moveTo(points[0].px, points[0].py);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].px, points[i].py);
      }
    }
  } else {
    // Direct path: draw all visible points
    let started = false;
    for (let i = startIdx; i < endIdx; i++) {
      const px = xScale(spectrum.x[i] as number);
      const py = yScale(spectrum.y[i] as number);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Draw all visible spectra onto the canvas.
 */
export function drawAllSpectra(
  ctx: CanvasRenderingContext2D,
  spectra: Spectrum[],
  xScale: ScaleLinear<number, number>,
  yScale: ScaleLinear<number, number>,
  width: number,
  height: number,
  highlightedId?: string,
): void {
  clearCanvas(ctx, width, height);

  spectra.forEach((spectrum, index) => {
    if (spectrum.visible === false) return;

    drawSpectrum(ctx, spectrum, index, xScale, yScale, width, {
      highlighted: spectrum.id === highlightedId,
      opacity: highlightedId && spectrum.id !== highlightedId ? 0.3 : 1.0,
    });
  });
}
