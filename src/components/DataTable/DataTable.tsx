/**
 * DataTable — Interactive tabular view of spectrum data.
 *
 * Displays X/Y values in a scrollable table with sorting
 * and optional region highlight. Useful for data inspection
 * and precision value reading.
 */

import { memo, useMemo, useState } from "react";
import type { Spectrum, Theme } from "../../types";
import { getThemeColors } from "../../utils/colors";

export interface DataTableProps {
  /** Spectrum to display. */
  spectrum: Spectrum;
  /** Theme. */
  theme?: Theme;
  /** Maximum rows to display. Defaults to 200. */
  maxRows?: number;
  /** Height of the table container. Defaults to 300. */
  height?: number;
  /** X-range to highlight [min, max]. */
  highlightRange?: [number, number];
}

export const DataTable = memo(function DataTable({
  spectrum,
  theme = "light",
  maxRows = 200,
  height = 300,
  highlightRange,
}: DataTableProps) {
  const colors = useMemo(() => getThemeColors(theme), [theme]);
  const [sortDesc, setSortDesc] = useState(false);

  const n = Math.min(spectrum.x.length, spectrum.y.length);

  // Build index array for sorting
  const indices = useMemo(() => {
    const arr = Array.from({ length: n }, (_, i) => i);
    if (sortDesc) arr.reverse();
    return arr.slice(0, maxRows);
  }, [n, sortDesc, maxRows]);

  const isHighlighted = (x: number): boolean => {
    if (!highlightRange) return false;
    const min = Math.min(highlightRange[0], highlightRange[1]);
    const max = Math.max(highlightRange[0], highlightRange[1]);
    return x >= min && x <= max;
  };

  const formatVal = (v: number): string => {
    if (Math.abs(v) >= 100) return v.toFixed(2);
    if (Math.abs(v) >= 0.01) return v.toFixed(4);
    return v.toExponential(3);
  };

  const headerBg = theme === "dark" ? "#1f2937" : "#f3f4f6";
  const borderColor = theme === "dark" ? "#374151" : "#e5e7eb";
  const hlBg = theme === "dark" ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)";

  return (
    <div
      className="spectraview-datatable"
      style={{
        height,
        overflow: "auto",
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        fontFamily: "monospace",
        fontSize: 12,
        color: colors.tickColor,
        background: colors.background,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              position: "sticky",
              top: 0,
              background: headerBg,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <th style={{ padding: "6px 8px", textAlign: "right" }}>#</th>
            <th
              style={{
                padding: "6px 8px",
                textAlign: "right",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => setSortDesc((d) => !d)}
              title="Click to reverse sort"
            >
              {spectrum.xUnit ?? "x"} {sortDesc ? "↑" : "↓"}
            </th>
            <th style={{ padding: "6px 8px", textAlign: "right" }}>
              {spectrum.yUnit ?? "y"}
            </th>
          </tr>
        </thead>
        <tbody>
          {indices.map((idx) => {
            const x = spectrum.x[idx] as number;
            const y = spectrum.y[idx] as number;
            return (
              <tr
                key={idx}
                style={{
                  background: isHighlighted(x) ? hlBg : "transparent",
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <td style={{ padding: "3px 8px", textAlign: "right", opacity: 0.5 }}>
                  {idx}
                </td>
                <td style={{ padding: "3px 8px", textAlign: "right" }}>
                  {formatVal(x)}
                </td>
                <td style={{ padding: "3px 8px", textAlign: "right" }}>
                  {formatVal(y)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {n > maxRows && (
        <div
          style={{
            padding: "6px 8px",
            textAlign: "center",
            fontSize: 11,
            opacity: 0.6,
            borderTop: `1px solid ${borderColor}`,
          }}
        >
          Showing {maxRows} of {n} points
        </div>
      )}
    </div>
  );
});
