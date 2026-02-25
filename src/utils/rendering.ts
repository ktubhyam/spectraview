/**
 * Canvas 2D rendering utilities for drawing spectral lines.
 *
 * Canvas is used for the data-heavy spectral line rendering (10K+ points)
 * while SVG handles axes, annotations, and interactive overlays.
 */

import type { ScaleLinear } from "d3-scale";
import type { Spectrum, LineStyle } from "../types";
import { getSpectrumColor } from "./colors";
import { lttbDownsample } from "./lttb";

/** Default line width for spectrum rendering. */
const LINE_WIDTH = 1.5;

/** Canvas dash patterns for line styles. */
const CANVAS_DASH_PATTERNS: Record<LineStyle, number[]> = {
  solid: [],
  dashed: [8, 4],
  dotted: [2, 2],
  "dash-dot": [8, 4, 2, 4],
};

/**
 * Threshold: if visible points exceed this count, apply LTTB downsampling.
 * Target output is plotWidth * 2 points — enough visual fidelity for
 * sub-pixel accuracy while dramatically reducing draw calls.
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
  const baseWidth = spectrum.lineWidth ?? LINE_WIDTH;
  const lineWidth = highlighted ? baseWidth + 1 : baseWidth;
  const dashPattern = CANVAS_DASH_PATTERNS[spectrum.lineStyle ?? "solid"] ?? [];

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
  ctx.setLineDash(dashPattern);

  if (visibleCount > DECIMATION_THRESHOLD) {
    // LTTB downsampled path: visually optimal point selection
    const targetPoints = Math.max(Math.ceil(plotWidth * 2), 200);
    const points = lttbDownsample(spectrum.x, spectrum.y, startIdx, endIdx, xScale, yScale, targetPoints);
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
