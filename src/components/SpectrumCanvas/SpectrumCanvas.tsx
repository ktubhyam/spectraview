/**
 * Canvas rendering layer for spectral data.
 *
 * Uses HTML5 Canvas 2D for high-performance rendering of spectral lines.
 * Redraws on zoom/pan transform changes and spectrum data changes.
 */

import { useEffect, useRef } from "react";
import type { ScaleLinear } from "d3-scale";
import type { Spectrum } from "../../types";
import { drawAllSpectra } from "../../utils/rendering";

export interface SpectrumCanvasProps {
  /** Spectra to render. */
  spectra: Spectrum[];
  /** X-axis scale (already zoomed). */
  xScale: ScaleLinear<number, number>;
  /** Y-axis scale (already zoomed). */
  yScale: ScaleLinear<number, number>;
  /** Canvas width in pixels. */
  width: number;
  /** Canvas height in pixels. */
  height: number;
  /** ID of the currently highlighted spectrum. */
  highlightedId?: string;
}

export function SpectrumCanvas({
  spectra,
  xScale,
  yScale,
  width,
  height,
  highlightedId,
}: SpectrumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    drawAllSpectra(ctx, spectra, xScale, yScale, width, height, highlightedId);
  }, [spectra, xScale, yScale, width, height, highlightedId]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    />
  );
}
