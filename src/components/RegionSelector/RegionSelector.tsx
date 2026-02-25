/**
 * Region selection overlay for click-drag x-axis region selection.
 *
 * Renders highlighted rectangular regions on the spectrum and
 * handles mouse interaction for creating new regions.
 */

import type { ScaleLinear } from "d3-scale";
import type { Region } from "../../types";
import type { ThemeColors } from "../../utils/colors";

export interface RegionSelectorProps {
  /** Existing regions to display. */
  regions: Region[];
  /** X-axis scale (zoomed). */
  xScale: ScaleLinear<number, number>;
  /** Plot area height. */
  height: number;
  /** Theme colors. */
  colors: ThemeColors;
}

export function RegionSelector({
  regions,
  xScale,
  height,
  colors,
}: RegionSelectorProps) {
  return (
    <g className="spectraview-regions">
      {regions.map((region, i) => {
        const x1 = xScale(region.xStart);
        const x2 = xScale(region.xEnd);
        const left = Math.min(x1, x2);
        const w = Math.abs(x2 - x1);

        return (
          <g key={`region-${i}`}>
            <rect
              x={left}
              y={0}
              width={w}
              height={height}
              fill={region.color ?? colors.regionFill}
              stroke={colors.regionStroke}
              strokeWidth={1}
            />
            {region.label && (
              <text
                x={left + w / 2}
                y={12}
                textAnchor="middle"
                fill={colors.labelColor}
                fontSize={10}
                fontFamily="system-ui, sans-serif"
              >
                {region.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
