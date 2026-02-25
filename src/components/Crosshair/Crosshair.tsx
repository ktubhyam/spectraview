/**
 * Crosshair overlay showing current cursor position with coordinate readout.
 *
 * Pure rendering component — mouse tracking is handled by the parent
 * SpectraView component on the shared zoom/interaction rect.
 */

import type { ThemeColors } from "../../utils/colors";

/** Position data for the crosshair. */
export interface CrosshairPosition {
  /** Pixel x coordinate within the plot area. */
  px: number;
  /** Pixel y coordinate within the plot area. */
  py: number;
  /** Data-space x value. */
  dataX: number;
  /** Data-space y value. */
  dataY: number;
}

export interface CrosshairProps {
  /** Current crosshair position, or null when not hovering. */
  position: CrosshairPosition | null;
  /** Plot area width. */
  width: number;
  /** Plot area height. */
  height: number;
  /** Theme colors. */
  colors: ThemeColors;
}

export function Crosshair({
  position,
  width,
  height,
  colors,
}: CrosshairProps) {
  if (!position) return null;

  return (
    <g className="spectraview-crosshair" pointerEvents="none">
      {/* Vertical line */}
      <line
        x1={position.px}
        x2={position.px}
        y1={0}
        y2={height}
        stroke={colors.crosshairColor}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      {/* Horizontal line */}
      <line
        x1={0}
        x2={width}
        y1={position.py}
        y2={position.py}
        stroke={colors.crosshairColor}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      {/* Coordinate readout */}
      <g
        transform={`translate(${Math.min(position.px + 10, width - 100)}, ${Math.max(position.py - 10, 20)})`}
      >
        <rect
          x={0}
          y={-14}
          width={90}
          height={18}
          rx={3}
          fill={colors.tooltipBg}
          stroke={colors.tooltipBorder}
          strokeWidth={0.5}
          opacity={0.9}
        />
        <text
          x={5}
          y={0}
          fill={colors.tooltipText}
          fontSize={10}
          fontFamily="monospace"
        >
          {formatValue(position.dataX)}, {formatValue(position.dataY)}
        </text>
      </g>
    </g>
  );
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 100) return Math.round(v).toString();
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(4);
}
