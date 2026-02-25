/**
 * Crosshair overlay showing current cursor position with coordinate readout.
 *
 * Renders vertical and horizontal dashed lines following the mouse,
 * with a tooltip showing the x,y values at the cursor position.
 */

import { useCallback, useState } from "react";
import type { ScaleLinear } from "d3-scale";
import type { ThemeColors } from "../../utils/colors";

export interface CrosshairProps {
  /** X-axis scale (zoomed). */
  xScale: ScaleLinear<number, number>;
  /** Y-axis scale (zoomed). */
  yScale: ScaleLinear<number, number>;
  /** Plot area width. */
  width: number;
  /** Plot area height. */
  height: number;
  /** Theme colors. */
  colors: ThemeColors;
  /** Whether crosshair is enabled. */
  enabled?: boolean;
  /** Callback when crosshair position changes. */
  onMove?: (x: number, y: number) => void;
}

interface CursorPosition {
  px: number;
  py: number;
  dataX: number;
  dataY: number;
}

export function Crosshair({
  xScale,
  yScale,
  width,
  height,
  colors,
  enabled = true,
  onMove,
}: CrosshairProps) {
  const [position, setPosition] = useState<CursorPosition | null>(null);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      if (!enabled) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const dataX = xScale.invert(px);
      const dataY = yScale.invert(py);

      setPosition({ px, py, dataX, dataY });
      onMove?.(dataX, dataY);
    },
    [xScale, yScale, enabled, onMove],
  );

  const handleMouseLeave = useCallback(() => {
    setPosition(null);
  }, []);

  if (!enabled) return null;

  return (
    <g className="spectraview-crosshair">
      {/* Invisible interaction rect to capture mouse events */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "crosshair" }}
      />

      {position && (
        <>
          {/* Vertical line */}
          <line
            x1={position.px}
            x2={position.px}
            y1={0}
            y2={height}
            stroke={colors.crosshairColor}
            strokeWidth={1}
            strokeDasharray="4 4"
            pointerEvents="none"
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
            pointerEvents="none"
          />
          {/* Coordinate readout */}
          <g
            transform={`translate(${Math.min(position.px + 10, width - 100)}, ${Math.max(position.py - 10, 20)})`}
            pointerEvents="none"
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
        </>
      )}
    </g>
  );
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 100) return Math.round(v).toString();
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(4);
}
