/**
 * Stacked display mode for comparing multiple spectra vertically.
 *
 * Each spectrum gets its own y-axis panel. Shared x-axis at the bottom.
 * Zoom/pan is synchronized across all panels.
 */

import { useMemo } from "react";
import type { ScaleLinear } from "d3-scale";
import type { Spectrum, Margin, Theme } from "../../types";
import { computeYExtent, createYScale } from "../../utils/scales";
import { getSpectrumColor, getThemeColors } from "../../utils/colors";
import { AxisLayer } from "../AxisLayer/AxisLayer";
import { SpectrumCanvas } from "../SpectrumCanvas/SpectrumCanvas";

export interface StackedViewProps {
  /** Spectra to display. */
  spectra: Spectrum[];
  /** Zoomed x-scale (shared across panels). */
  xScale: ScaleLinear<number, number>;
  /** Full plot width. */
  plotWidth: number;
  /** Full plot height (will be divided among panels). */
  plotHeight: number;
  /** Chart margins. */
  margin: Margin;
  /** Theme. */
  theme: Theme;
  /** Show grid lines. */
  showGrid: boolean;
  /** X-axis label. */
  xLabel: string;
  /** Y-axis label. */
  yLabel: string;
}

/** Gap between stacked panels in pixels. */
const PANEL_GAP = 8;

export function StackedView({
  spectra,
  xScale,
  plotWidth,
  plotHeight,
  margin,
  theme,
  showGrid,
  xLabel,
  yLabel,
}: StackedViewProps) {
  const visible = spectra.filter((s) => s.visible !== false);
  const colors = useMemo(() => getThemeColors(theme), [theme]);
  const panelCount = visible.length;
  const totalGap = (panelCount - 1) * PANEL_GAP;
  const panelHeight = Math.max(
    40,
    Math.floor((plotHeight - totalGap) / Math.max(panelCount, 1)),
  );

  return (
    <g className="spectraview-stacked">
      {visible.map((spectrum, i) => {
        const yOffset = i * (panelHeight + PANEL_GAP);
        const yExtent = computeYExtent([spectrum]);
        const yScale = createYScale(
          yExtent,
          panelHeight + margin.top + margin.bottom,
          { ...margin, top: 0, bottom: 0 },
        );
        const color = spectrum.color ?? getSpectrumColor(i);
        const coloredSpectrum = { ...spectrum, color };

        return (
          <g key={spectrum.id} transform={`translate(0, ${yOffset})`}>
            {/* Panel background */}
            <rect
              x={0}
              y={0}
              width={plotWidth}
              height={panelHeight}
              fill="transparent"
              stroke={colors.gridColor}
              strokeWidth={0.5}
              rx={2}
            />

            {/* Axes */}
            <AxisLayer
              xScale={xScale}
              yScale={yScale}
              width={plotWidth}
              height={panelHeight}
              xLabel={i === panelCount - 1 ? xLabel : ""}
              yLabel={yLabel}
              showGrid={showGrid}
              colors={colors}
            />

            {/* Spectrum label */}
            <text
              x={4}
              y={14}
              fill={color}
              fontSize={11}
              fontFamily="system-ui, sans-serif"
              fontWeight={500}
            >
              {spectrum.label}
            </text>

            {/* Canvas for this panel */}
            <foreignObject x={0} y={0} width={plotWidth} height={panelHeight}>
              <SpectrumCanvas
                spectra={[coloredSpectrum]}
                xScale={xScale}
                yScale={yScale}
                width={plotWidth}
                height={panelHeight}
              />
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}
