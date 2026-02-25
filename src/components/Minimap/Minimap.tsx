/**
 * Minimap — A small overview component showing the full spectrum
 * with a highlighted viewport rectangle indicating the current
 * zoom region.
 *
 * Renders using Canvas for the spectrum line and SVG for the
 * viewport overlay.
 */

import { memo, useEffect, useRef, useMemo } from "react";
import { scaleLinear } from "d3-scale";
import type { Spectrum, Theme } from "../../types";
import { getThemeColors } from "../../utils/colors";
import { getSpectrumColor } from "../../utils/colors";

export interface MinimapProps {
  /** Spectra to render in the minimap. */
  spectra: Spectrum[];
  /** Full X extent [min, max] of the data. */
  xExtent: [number, number];
  /** Full Y extent [min, max] of the data. */
  yExtent: [number, number];
  /** Currently visible X domain from the zoomed view. */
  visibleXDomain: [number, number];
  /** Currently visible Y domain from the zoomed view (reserved for future use). */
  visibleYDomain?: [number, number];
  /** Minimap width in pixels. Defaults to 200. */
  width?: number;
  /** Minimap height in pixels. Defaults to 50. */
  height?: number;
  /** Theme. */
  theme?: Theme;
  /** Whether the view is currently zoomed. */
  isZoomed?: boolean;
}

export const Minimap = memo(function Minimap({
  spectra,
  xExtent,
  yExtent,
  visibleXDomain,
  width = 200,
  height = 50,
  theme = "light",
  isZoomed = false,
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useMemo(() => getThemeColors(theme), [theme]);

  // Full-range scales for the minimap
  const xScale = useMemo(
    () => scaleLinear().domain(xExtent).range([0, width]),
    [xExtent, width],
  );
  const yScale = useMemo(
    () => scaleLinear().domain(yExtent).range([height - 2, 2]),
    [yExtent, height],
  );

  // Draw spectra on canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    for (let s = 0; s < spectra.length; s++) {
      const spectrum = spectra[s];
      if (spectrum.visible === false) continue;
      const n = Math.min(spectrum.x.length, spectrum.y.length);
      if (n < 2) continue;

      const color = spectrum.color ?? getSpectrumColor(s);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.7;

      // Decimate for minimap: use every Nth point
      const step = Math.max(1, Math.floor(n / width));
      let started = false;

      for (let i = 0; i < n; i += step) {
        const px = xScale(spectrum.x[i] as number);
        const py = yScale(spectrum.y[i] as number);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.stroke();
    }
  }, [spectra, xScale, yScale, width, height]);

  // Compute viewport rectangle position
  const vpLeft = xScale(Math.min(visibleXDomain[0], visibleXDomain[1]));
  const vpRight = xScale(Math.max(visibleXDomain[0], visibleXDomain[1]));
  const vpWidth = Math.max(vpRight - vpLeft, 2);

  return (
    <div
      className="spectraview-minimap"
      style={{
        position: "relative",
        width,
        height,
        border: `1px solid ${colors.gridColor}`,
        borderRadius: 3,
        overflow: "hidden",
        background: colors.background,
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      {isZoomed && (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Dim outside viewport */}
          <rect
            x={0}
            y={0}
            width={vpLeft}
            height={height}
            fill={colors.background}
            opacity={0.6}
          />
          <rect
            x={vpLeft + vpWidth}
            y={0}
            width={width - vpLeft - vpWidth}
            height={height}
            fill={colors.background}
            opacity={0.6}
          />
          {/* Viewport rectangle */}
          <rect
            x={vpLeft}
            y={0}
            width={vpWidth}
            height={height}
            fill="none"
            stroke={theme === "dark" ? "#60a5fa" : "#3b82f6"}
            strokeWidth={1.5}
            rx={1}
          />
        </svg>
      )}
    </div>
  );
});
