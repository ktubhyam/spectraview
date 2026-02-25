/**
 * SVG axis layer rendering X and Y axes with labels and grid lines.
 *
 * Built with plain SVG for minimal bundle size. Handles reversed x-axis
 * (standard for IR wavenumber display).
 */

import type { ScaleLinear } from "d3-scale";
import type { ThemeColors } from "../../utils/colors";

export interface AxisLayerProps {
  /** X-axis scale (already zoomed). */
  xScale: ScaleLinear<number, number>;
  /** Y-axis scale (already zoomed). */
  yScale: ScaleLinear<number, number>;
  /** Plot area width (excluding margins). */
  width: number;
  /** Plot area height (excluding margins). */
  height: number;
  /** X-axis label. */
  xLabel?: string;
  /** Y-axis label. */
  yLabel?: string;
  /** Show grid lines. */
  showGrid?: boolean;
  /** Theme colors. */
  colors: ThemeColors;
}

/** Number of tick marks to show on each axis. */
const TICK_COUNT = 8;

/**
 * Generate evenly-spaced tick values for a linear scale.
 */
function generateTicks(scale: ScaleLinear<number, number>, count: number): number[] {
  const [d0, d1] = scale.domain() as [number, number];
  const min = Math.min(d0, d1);
  const max = Math.max(d0, d1);
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

/**
 * Format a tick value for display.
 */
function formatTick(value: number): string {
  if (Math.abs(value) >= 1000) return Math.round(value).toString();
  if (Math.abs(value) >= 1) return value.toFixed(1);
  if (Math.abs(value) >= 0.01) return value.toFixed(3);
  return value.toExponential(1);
}

export function AxisLayer({
  xScale,
  yScale,
  width,
  height,
  xLabel,
  yLabel,
  showGrid = true,
  colors,
}: AxisLayerProps) {
  const xTicks = generateTicks(xScale, TICK_COUNT);
  const yTicks = generateTicks(yScale, TICK_COUNT - 2);

  return (
    <g>
      {/* Grid lines */}
      {showGrid && (
        <g>
          {xTicks.map((tick) => (
            <line
              key={`xgrid-${tick}`}
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={0}
              y2={height}
              stroke={colors.gridColor}
              strokeWidth={0.5}
            />
          ))}
          {yTicks.map((tick) => (
            <line
              key={`ygrid-${tick}`}
              x1={0}
              x2={width}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke={colors.gridColor}
              strokeWidth={0.5}
            />
          ))}
        </g>
      )}

      {/* X-axis */}
      <g transform={`translate(0, ${height})`}>
        <line x1={0} x2={width} y1={0} y2={0} stroke={colors.axisColor} />
        {xTicks.map((tick) => (
          <g key={`xtick-${tick}`} transform={`translate(${xScale(tick)}, 0)`}>
            <line y1={0} y2={6} stroke={colors.axisColor} />
            <text
              y={20}
              textAnchor="middle"
              fill={colors.tickColor}
              fontSize={11}
              fontFamily="system-ui, sans-serif"
            >
              {formatTick(tick)}
            </text>
          </g>
        ))}
        {xLabel && (
          <text
            x={width / 2}
            y={42}
            textAnchor="middle"
            fill={colors.labelColor}
            fontSize={13}
            fontFamily="system-ui, sans-serif"
          >
            {xLabel}
          </text>
        )}
      </g>

      {/* Y-axis */}
      <g>
        <line x1={0} x2={0} y1={0} y2={height} stroke={colors.axisColor} />
        {yTicks.map((tick) => (
          <g key={`ytick-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
            <line x1={-6} x2={0} stroke={colors.axisColor} />
            <text
              x={-10}
              textAnchor="end"
              dominantBaseline="middle"
              fill={colors.tickColor}
              fontSize={11}
              fontFamily="system-ui, sans-serif"
            >
              {formatTick(tick)}
            </text>
          </g>
        ))}
        {yLabel && (
          <text
            transform={`translate(-50, ${height / 2}) rotate(-90)`}
            textAnchor="middle"
            fill={colors.labelColor}
            fontSize={13}
            fontFamily="system-ui, sans-serif"
          >
            {yLabel}
          </text>
        )}
      </g>
    </g>
  );
}
