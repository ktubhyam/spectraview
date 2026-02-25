/**
 * Export dropdown menu for saving spectra in various formats.
 */

import { useCallback, useState } from "react";
import type { Theme } from "../../types";

export interface ExportMenuProps {
  /** Theme for styling. */
  theme: Theme;
  /** Export as PNG. */
  onExportPng?: () => void;
  /** Export as SVG. */
  onExportSvg?: () => void;
  /** Export as CSV. */
  onExportCsv?: () => void;
  /** Export as JSON. */
  onExportJson?: () => void;
}

const menuButtonStyle = (theme: Theme): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 28,
  padding: "0 8px",
  border: `1px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
  borderRadius: 4,
  background: theme === "dark" ? "#1f2937" : "#ffffff",
  color: theme === "dark" ? "#d1d5db" : "#374151",
  fontSize: 12,
  cursor: "pointer",
  lineHeight: 1,
  position: "relative" as const,
});

const dropdownStyle = (theme: Theme): React.CSSProperties => ({
  position: "absolute" as const,
  top: 30,
  left: 0,
  background: theme === "dark" ? "#1f2937" : "#ffffff",
  border: `1px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
  borderRadius: 4,
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  zIndex: 200,
  minWidth: 100,
  overflow: "hidden",
});

const optionStyle = (theme: Theme): React.CSSProperties => ({
  display: "block",
  width: "100%",
  padding: "6px 12px",
  border: "none",
  background: "transparent",
  color: theme === "dark" ? "#d1d5db" : "#374151",
  fontSize: 12,
  textAlign: "left" as const,
  cursor: "pointer",
});

export function ExportMenu({
  theme,
  onExportPng,
  onExportSvg,
  onExportCsv,
  onExportJson,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (handler?: () => void) => {
      setOpen(false);
      handler?.();
    },
    [],
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        style={menuButtonStyle(theme)}
        onClick={() => setOpen(!open)}
        aria-label="Export"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Export
      </button>
      {open && (
        <div style={dropdownStyle(theme)} role="menu">
          {onExportPng && (
            <button
              type="button"
              role="menuitem"
              style={optionStyle(theme)}
              onClick={() => handleSelect(onExportPng)}
            >
              PNG Image
            </button>
          )}
          {onExportSvg && (
            <button
              type="button"
              role="menuitem"
              style={optionStyle(theme)}
              onClick={() => handleSelect(onExportSvg)}
            >
              SVG Vector
            </button>
          )}
          {onExportCsv && (
            <button
              type="button"
              role="menuitem"
              style={optionStyle(theme)}
              onClick={() => handleSelect(onExportCsv)}
            >
              CSV Data
            </button>
          )}
          {onExportJson && (
            <button
              type="button"
              role="menuitem"
              style={optionStyle(theme)}
              onClick={() => handleSelect(onExportJson)}
            >
              JSON Data
            </button>
          )}
        </div>
      )}
    </div>
  );
}
