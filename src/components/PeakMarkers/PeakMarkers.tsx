/**
 * Peak annotation markers rendered as SVG overlays.
 *
 * Displays small triangles at peak positions with wavenumber labels.
 * Supports click interaction for peak selection.
 */

import type { ScaleLinear } from "d3-scale";
import type { Peak } from "../../types";
import type { ThemeColors } from "../../utils/colors";

export interface PeakMarkersProps {
  /** Peaks to display. */
  peaks: Peak[];
  /** X-axis scale (zoomed). */
  xScale: ScaleLinear<number, number>;
  /** Y-axis scale (zoomed). */
  yScale: ScaleLinear<number, number>;
  /** Theme colors. */
  colors: ThemeColors;
  /** Callback when a peak is clicked. */
  onPeakClick?: (peak: Peak) => void;
}

/** Size of the peak marker triangle. */
const MARKER_SIZE = 5;

/** Vertical offset for the label above the marker. */
const LABEL_OFFSET = 14;

export function PeakMarkers({
  peaks,
  xScale,
  yScale,
  colors,
  onPeakClick,
}: PeakMarkersProps) {
  // Get visible domain to cull off-screen peaks
  const [xMin, xMax] = xScale.domain() as [number, number];
  const domainMin = Math.min(xMin, xMax);
  const domainMax = Math.max(xMin, xMax);

  const visiblePeaks = peaks.filter(
    (p) => p.x >= domainMin && p.x <= domainMax,
  );

  return (
    <g className="spectraview-peaks">
      {visiblePeaks.map((peak, i) => {
        const px = xScale(peak.x);
        const py = yScale(peak.y);

        return (
          <g
            key={`peak-${peak.x}-${i}`}
            transform={`translate(${px}, ${py})`}
            style={{ cursor: onPeakClick ? "pointer" : "default" }}
            onClick={() => onPeakClick?.(peak)}
          >
            {/* Triangle marker pointing down */}
            <polygon
              points={`0,${-MARKER_SIZE} ${-MARKER_SIZE},${-MARKER_SIZE * 2.5} ${MARKER_SIZE},${-MARKER_SIZE * 2.5}`}
              fill={colors.labelColor}
              opacity={0.8}
            />
            {/* Wavenumber label */}
            {peak.label && (
              <text
                y={-MARKER_SIZE * 2.5 - LABEL_OFFSET}
                textAnchor="middle"
                fill={colors.labelColor}
                fontSize={10}
                fontFamily="system-ui, sans-serif"
                fontWeight={500}
              >
                {peak.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
