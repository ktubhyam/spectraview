/**
 * Hook for exporting the spectrum view as PNG, SVG, or CSV data.
 */

import { useCallback } from "react";
import type { Spectrum } from "../types";

export interface UseExportReturn {
  /** Export the canvas as a PNG data URL. */
  exportPng: (canvas: HTMLCanvasElement, filename?: string) => void;
  /** Export visible spectra as CSV text. */
  exportCsv: (spectra: Spectrum[], filename?: string) => void;
  /** Export visible spectra as JSON. */
  exportJson: (spectra: Spectrum[], filename?: string) => void;
}

/**
 * Trigger a file download in the browser.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Hook for exporting spectrum data and visualizations.
 */
export function useExport(): UseExportReturn {
  const exportPng = useCallback(
    (canvas: HTMLCanvasElement, filename = "spectrum.png") => {
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, filename);
      }, "image/png");
    },
    [],
  );

  const exportCsv = useCallback(
    (spectra: Spectrum[], filename = "spectra.csv") => {
      const visible = spectra.filter((s) => s.visible !== false);
      if (visible.length === 0) return;

      // Build CSV with shared x-axis or per-spectrum columns
      if (visible.length === 1) {
        const s = visible[0];
        const header = `${s.xUnit ?? "x"},${s.yUnit ?? "y"}\n`;
        const rows = Array.from(s.x).map(
          (x, i) => `${x},${s.y[i]}`,
        );
        const csv = header + rows.join("\n");
        downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
      } else {
        // Multi-spectrum: each gets its own x,y column pair
        const maxLen = Math.max(...visible.map((s) => s.x.length));
        const header = visible
          .map((s) => `${s.label}_x,${s.label}_y`)
          .join(",");
        const rows: string[] = [];
        for (let i = 0; i < maxLen; i++) {
          const values = visible.map((s) => {
            if (i < s.x.length) return `${s.x[i]},${s.y[i]}`;
            return ",";
          });
          rows.push(values.join(","));
        }
        const csv = header + "\n" + rows.join("\n");
        downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
      }
    },
    [],
  );

  const exportJson = useCallback(
    (spectra: Spectrum[], filename = "spectra.json") => {
      const visible = spectra.filter((s) => s.visible !== false);
      const output = visible.map((s) => ({
        label: s.label,
        x: Array.from(s.x),
        y: Array.from(s.y),
        xUnit: s.xUnit,
        yUnit: s.yUnit,
        type: s.type,
      }));
      const json = JSON.stringify(output, null, 2);
      downloadBlob(new Blob([json], { type: "application/json" }), filename);
    },
    [],
  );

  return { exportPng, exportCsv, exportJson };
}
