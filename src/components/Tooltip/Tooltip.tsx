/**
 * Tooltip — Enhanced multi-spectrum data readout on hover.
 *
 * Shows values from all visible spectra at the current cursor X position,
 * with colored indicators matching each spectrum's line color.
 * Optionally shows the nearest peak annotation.
 */

import { memo, useMemo } from "react";
import type { Spectrum, Peak } from "../../types";
import type { ThemeColors } from "../../utils/colors";
import { getSpectrumColor } from "../../utils/colors";
import { binarySearchClosest } from "../../utils/snap";

export interface TooltipData {
  /** Cursor pixel position. */
  px: number;
  py: number;
  /** Cursor data-space position. */
  dataX: number;
  dataY: number;
}

export interface TooltipProps {
  /** Tooltip position, or null when hidden. */
  data: TooltipData | null;
  /** Spectra for multi-value readout. */
  spectra: Spectrum[];
  /** Peaks for nearest-peak indicator. */
  peaks?: Peak[];
  /** Plot area width. */
  plotWidth: number;
  /** Plot area height. */
  plotHeight: number;
  /** Theme colors. */
  colors: ThemeColors;
  /** Number format for values. Defaults to "auto". */
  numberFormat?: "auto" | "fixed2" | "fixed4" | "scientific";
}

function formatNumber(v: number, format: string): string {
  switch (format) {
    case "fixed2":
      return v.toFixed(2);
    case "fixed4":
      return v.toFixed(4);
    case "scientific":
      return v.toExponential(2);
    default: // auto
      if (Math.abs(v) >= 100) return Math.round(v).toString();
      if (Math.abs(v) >= 1) return v.toFixed(2);
      if (Math.abs(v) >= 0.01) return v.toFixed(4);
      return v.toExponential(2);
  }
}

export const Tooltip = memo(function Tooltip({
  data,
  spectra,
  peaks = [],
  plotWidth,
  plotHeight,
  colors,
  numberFormat = "auto",
}: TooltipProps) {
  if (!data) return null;

  // Find Y values for each visible spectrum at cursor X
  const entries = useMemo(() => {
    if (!data) return [];
    return spectra
      .filter((s) => s.visible !== false)
      .map((spectrum, i) => {
        const n = Math.min(spectrum.x.length, spectrum.y.length);
        if (n < 1) return null;
        const idx = binarySearchClosest(spectrum.x, data.dataX, n);
        if (idx < 0) return null;
        return {
          label: spectrum.label,
          color: spectrum.color ?? getSpectrumColor(i),
          value: spectrum.y[idx] as number,
          x: spectrum.x[idx] as number,
        };
      })
      .filter(Boolean) as Array<{
      label: string;
      color: string;
      value: number;
      x: number;
    }>;
  }, [data?.dataX, spectra]);

  // Find nearest peak
  const nearestPeak = useMemo(() => {
    if (!data || peaks.length === 0) return null;
    let best: Peak | null = null;
    let bestDist = Infinity;
    for (const peak of peaks) {
      const dist = Math.abs(peak.x - data.dataX);
      if (dist < bestDist) {
        bestDist = dist;
        best = peak;
      }
    }
    return best;
  }, [data?.dataX, peaks]);

  const lineHeight = 16;
  const headerHeight = 18;
  const peakLineHeight = nearestPeak ? lineHeight : 0;
  const tooltipHeight = headerHeight + entries.length * lineHeight + peakLineHeight + 8;
  const tooltipWidth = 160;

  // Position tooltip to avoid clipping
  let tx = data.px + 15;
  let ty = data.py - tooltipHeight / 2;
  if (tx + tooltipWidth > plotWidth) tx = data.px - tooltipWidth - 15;
  if (ty < 0) ty = 4;
  if (ty + tooltipHeight > plotHeight) ty = plotHeight - tooltipHeight - 4;

  return (
    <g
      className="spectraview-tooltip"
      transform={`translate(${tx}, ${ty})`}
      pointerEvents="none"
    >
      {/* Background */}
      <rect
        x={0}
        y={0}
        width={tooltipWidth}
        height={tooltipHeight}
        rx={4}
        fill={colors.tooltipBg}
        stroke={colors.tooltipBorder}
        strokeWidth={0.5}
        opacity={0.95}
      />

      {/* Header: X value */}
      <text
        x={8}
        y={14}
        fill={colors.tooltipText}
        fontSize={10}
        fontFamily="monospace"
        fontWeight={600}
      >
        x = {formatNumber(data.dataX, numberFormat)}
      </text>

      {/* Spectrum values */}
      {entries.map((entry, i) => (
        <g key={entry.label} transform={`translate(0, ${headerHeight + i * lineHeight})`}>
          <circle cx={12} cy={8} r={3} fill={entry.color} />
          <text
            x={20}
            y={11}
            fill={colors.tooltipText}
            fontSize={9}
            fontFamily="monospace"
          >
            {entry.label.slice(0, 10)}: {formatNumber(entry.value, numberFormat)}
          </text>
        </g>
      ))}

      {/* Nearest peak */}
      {nearestPeak && (
        <text
          x={8}
          y={headerHeight + entries.length * lineHeight + 12}
          fill={colors.labelColor}
          fontSize={9}
          fontFamily="monospace"
          fontStyle="italic"
        >
          Peak: {nearestPeak.label ?? formatNumber(nearestPeak.x, numberFormat)}
        </text>
      )}
    </g>
  );
});
