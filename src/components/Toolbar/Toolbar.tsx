/**
 * Toolbar component with zoom controls and action buttons.
 *
 * Provides zoom in, zoom out, reset, and export controls
 * for the SpectraView component.
 */

import type { Theme } from "../../types";

export interface ToolbarProps {
  /** Zoom in handler. */
  onZoomIn: () => void;
  /** Zoom out handler. */
  onZoomOut: () => void;
  /** Reset zoom handler. */
  onReset: () => void;
  /** Whether the view is currently zoomed. */
  isZoomed: boolean;
  /** Theme. */
  theme: Theme;
}

/** Inline styles to avoid CSS dependency for the toolbar. */
const buttonStyle = (theme: Theme): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  border: `1px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
  borderRadius: 4,
  background: theme === "dark" ? "#1f2937" : "#ffffff",
  color: theme === "dark" ? "#d1d5db" : "#374151",
  fontSize: 14,
  cursor: "pointer",
  padding: 0,
  lineHeight: 1,
});

const toolbarStyle = (theme: Theme): React.CSSProperties => ({
  display: "flex",
  gap: 4,
  padding: "4px 0",
  borderBottom: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
});

export function Toolbar({
  onZoomIn,
  onZoomOut,
  onReset,
  isZoomed,
  theme,
}: ToolbarProps) {
  return (
    <div style={toolbarStyle(theme)} className="spectraview-toolbar">
      <button
        type="button"
        style={buttonStyle(theme)}
        onClick={onZoomIn}
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        style={buttonStyle(theme)}
        onClick={onZoomOut}
        title="Zoom out"
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        type="button"
        style={{
          ...buttonStyle(theme),
          opacity: isZoomed ? 1 : 0.4,
        }}
        onClick={onReset}
        disabled={!isZoomed}
        title="Reset zoom"
        aria-label="Reset zoom"
      >
        ↺
      </button>
    </div>
  );
}
