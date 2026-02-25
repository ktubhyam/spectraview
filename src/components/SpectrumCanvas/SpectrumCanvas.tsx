/**
 * Canvas rendering layer for spectral data.
 *
 * Uses HTML5 Canvas 2D for high-performance rendering of spectral lines.
 * Redraws on zoom/pan transform changes and spectrum data changes.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
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

export const SpectrumCanvas = forwardRef<HTMLCanvasElement, SpectrumCanvasProps>(
  function SpectrumCanvas(
    { spectra, xScale, yScale, width, height, highlightedId },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dprRef = useRef(1);

    // Expose the internal canvas ref to parent via forwarded ref
    useImperativeHandle(ref, () => canvasRef.current!, []);

    // Set up canvas DPR only when dimensions change (avoids flicker on zoom)
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }, [width, height]);

    // Redraw spectra when data or scales change
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = dprRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
  },
);
