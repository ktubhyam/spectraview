/**
 * AnnotationLayer — Renders text annotations at specified data positions.
 *
 * Annotations are positioned in data-space and transformed to pixel-space
 * via the provided scales. Supports optional anchor lines from the
 * annotation text to the data point.
 */

import type { ScaleLinear } from "d3-scale";
import type { Annotation } from "../../types";
import type { ThemeColors } from "../../utils/colors";

export interface AnnotationLayerProps {
  /** Annotations to render. */
  annotations: Annotation[];
  /** X scale (zoomed). */
  xScale: ScaleLinear<number, number>;
  /** Y scale (zoomed). */
  yScale: ScaleLinear<number, number>;
  /** Theme colors. */
  colors: ThemeColors;
}

export function AnnotationLayer({
  annotations,
  xScale,
  yScale,
  colors,
}: AnnotationLayerProps) {
  if (annotations.length === 0) return null;

  return (
    <g className="spectraview-annotations" pointerEvents="none">
      {annotations.map((ann) => {
        const px = xScale(ann.x);
        const py = yScale(ann.y);
        const [dx, dy] = ann.offset ?? [0, -20];
        const textX = px + dx;
        const textY = py + dy;
        const fontSize = ann.fontSize ?? 11;
        const color = ann.color ?? colors.tickColor;
        const showLine = ann.showAnchorLine !== false;

        return (
          <g key={ann.id}>
            {/* Anchor line */}
            {showLine && (
              <line
                x1={px}
                y1={py}
                x2={textX}
                y2={textY}
                stroke={color}
                strokeWidth={0.75}
                strokeDasharray="3 2"
                opacity={0.6}
              />
            )}
            {/* Anchor dot */}
            <circle cx={px} cy={py} r={2.5} fill={color} opacity={0.8} />
            {/* Text background for readability */}
            <text
              x={textX}
              y={textY}
              fill={colors.background}
              fontSize={fontSize}
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              dominantBaseline="auto"
              stroke={colors.background}
              strokeWidth={3}
              strokeLinejoin="round"
            >
              {ann.text}
            </text>
            {/* Annotation text */}
            <text
              x={textX}
              y={textY}
              fill={color}
              fontSize={fontSize}
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              dominantBaseline="auto"
            >
              {ann.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}
