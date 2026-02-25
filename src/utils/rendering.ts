/**
 * Canvas 2D rendering utilities for drawing spectral lines.
 *
 * Canvas is used for the data-heavy spectral line rendering (10K+ points)
 * while SVG (via visx) handles axes, annotations, and interactive overlays.
 */

import type { ScaleLinear } from "d3-scale";
import type { Spectrum } from "../types";
import { getSpectrumColor } from "./colors";

/** Line width for spectrum rendering. */
const LINE_WIDTH = 1.5;

/** Line width when a spectrum is highlighted/hovered. */
const HIGHLIGHT_LINE_WIDTH = 2.5;

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
 * Skips points that fall outside the visible x-domain for zoom performance.
 */
export function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  spectrum: Spectrum,
  index: number,
  xScale: ScaleLinear<number, number>,
  yScale: ScaleLinear<number, number>,
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

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = opacity;
  ctx.lineJoin = "round";

  let started = false;

  for (let i = 0; i < n; i++) {
    const xVal = spectrum.x[i] as number;

    // Skip points outside the visible domain (with 1-point margin for continuity)
    if (xVal < domainMin && i < n - 1 && (spectrum.x[i + 1] as number) < domainMin) {
      continue;
    }
    if (xVal > domainMax && i > 0 && (spectrum.x[i - 1] as number) > domainMax) {
      continue;
    }

    const px = xScale(xVal);
    const py = yScale(spectrum.y[i] as number);

    if (!started) {
      ctx.moveTo(px, py);
      started = true;
    } else {
      ctx.lineTo(px, py);
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

    drawSpectrum(ctx, spectrum, index, xScale, yScale, {
      highlighted: spectrum.id === highlightedId,
      opacity: highlightedId && spectrum.id !== highlightedId ? 0.3 : 1.0,
    });
  });
}
