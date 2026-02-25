/**
 * Legend component showing spectrum names, color swatches, and visibility toggles.
 *
 * Supports hover highlighting and click-to-toggle visibility.
 */

import { memo } from "react";
import type { Spectrum, Theme } from "../../types";
import { getSpectrumColor } from "../../utils/colors";

/** Position for the legend relative to the chart. */
export type LegendPosition = "top" | "bottom" | "left" | "right";

export interface LegendProps {
  /** Spectra to list in the legend. */
  spectra: Spectrum[];
  /** Theme for styling. */
  theme: Theme;
  /** Legend position. */
  position: LegendPosition;
  /** Callback when a spectrum's visibility is toggled. */
  onToggleVisibility?: (id: string) => void;
  /** Callback when hovering a spectrum in the legend. */
  onHighlight?: (id: string | null) => void;
  /** Currently highlighted spectrum ID. */
  highlightedId?: string | null;
}

const containerStyle = (
  theme: Theme,
  position: LegendPosition,
): React.CSSProperties => ({
  display: "flex",
  flexDirection: position === "left" || position === "right" ? "column" : "row",
  flexWrap: "wrap",
  gap: 6,
  padding: "4px 8px",
  fontSize: 12,
  fontFamily: "system-ui, sans-serif",
  borderTop:
    position === "bottom"
      ? `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`
      : undefined,
  borderBottom:
    position === "top"
      ? `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`
      : undefined,
  borderLeft:
    position === "right"
      ? `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`
      : undefined,
  borderRight:
    position === "left"
      ? `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`
      : undefined,
});

const itemStyle = (
  theme: Theme,
  isHidden: boolean,
  isHighlighted: boolean,
): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
  opacity: isHidden ? 0.4 : 1,
  fontWeight: isHighlighted ? 600 : 400,
  color: theme === "dark" ? "#e5e7eb" : "#374151",
  userSelect: "none",
  padding: "2px 4px",
  borderRadius: 3,
  background: isHighlighted
    ? theme === "dark"
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.04)"
    : "transparent",
  transition: "background 0.15s, opacity 0.15s",
});

const swatchStyle = (
  color: string,
  isHidden: boolean,
): React.CSSProperties => ({
  width: 12,
  height: 3,
  borderRadius: 1,
  background: color,
  opacity: isHidden ? 0.4 : 1,
  flexShrink: 0,
});

export const Legend = memo(function Legend({
  spectra,
  theme,
  position,
  onToggleVisibility,
  onHighlight,
  highlightedId,
}: LegendProps) {
  if (spectra.length <= 1) return null;

  return (
    <div
      className="spectraview-legend"
      style={containerStyle(theme, position)}
      role="list"
      aria-label="Spectrum legend"
    >
      {spectra.map((s, i) => {
        const color = s.color ?? getSpectrumColor(i);
        const isHidden = s.visible === false;
        const isHighlighted = highlightedId === s.id;

        return (
          <div
            key={s.id}
            role="listitem"
            style={itemStyle(theme, isHidden, isHighlighted)}
            onClick={() => onToggleVisibility?.(s.id)}
            onMouseEnter={() => onHighlight?.(s.id)}
            onMouseLeave={() => onHighlight?.(null)}
            title={isHidden ? `Show ${s.label}` : `Hide ${s.label}`}
          >
            <span style={swatchStyle(color, isHidden)} />
            <span
              style={{
                textDecoration: isHidden ? "line-through" : "none",
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
});
