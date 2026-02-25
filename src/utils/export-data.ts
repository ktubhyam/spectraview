/**
 * Data export utilities for CSV and JSON output.
 *
 * Supports full spectrum export, region-limited export, and
 * multi-spectrum batch export.
 *
 * @module export-data
 */

import type { Spectrum } from "../types";

export interface ExportOptions {
  /** Delimiter for CSV. Defaults to ",". */
  delimiter?: string;
  /** Include header row. Defaults to true. */
  includeHeader?: boolean;
  /** X-range to export [min, max]. If undefined, exports all. */
  xRange?: [number, number];
  /** Number of decimal places. Defaults to 6. */
  precision?: number;
}

/**
 * Export a single spectrum to CSV string.
 */
export function spectrumToCsv(
  spectrum: Spectrum,
  options: ExportOptions = {},
): string {
  const {
    delimiter = ",",
    includeHeader = true,
    xRange,
    precision = 6,
  } = options;

  const n = Math.min(spectrum.x.length, spectrum.y.length);
  const lines: string[] = [];

  if (includeHeader) {
    const xLabel = spectrum.xUnit ?? "x";
    const yLabel = spectrum.yUnit ?? "y";
    lines.push(`${xLabel}${delimiter}${yLabel}`);
  }

  for (let i = 0; i < n; i++) {
    const x = spectrum.x[i] as number;
    if (xRange) {
      const min = Math.min(xRange[0], xRange[1]);
      const max = Math.max(xRange[0], xRange[1]);
      if (x < min || x > max) continue;
    }
    const y = spectrum.y[i] as number;
    lines.push(`${x.toFixed(precision)}${delimiter}${y.toFixed(precision)}`);
  }

  return lines.join("\n");
}

/**
 * Export multiple spectra to CSV with shared X column.
 *
 * Assumes all spectra share the same X values.
 */
export function multiSpectraToCsv(
  spectra: Spectrum[],
  options: ExportOptions = {},
): string {
  const {
    delimiter = ",",
    includeHeader = true,
    xRange,
    precision = 6,
  } = options;

  if (spectra.length === 0) return "";

  const ref = spectra[0];
  const n = Math.min(...spectra.map((s) => Math.min(s.x.length, s.y.length)));
  const lines: string[] = [];

  if (includeHeader) {
    const headers = [
      ref.xUnit ?? "x",
      ...spectra.map((s) => s.label),
    ];
    lines.push(headers.join(delimiter));
  }

  for (let i = 0; i < n; i++) {
    const x = ref.x[i] as number;
    if (xRange) {
      const min = Math.min(xRange[0], xRange[1]);
      const max = Math.max(xRange[0], xRange[1]);
      if (x < min || x > max) continue;
    }
    const values = [
      x.toFixed(precision),
      ...spectra.map((s) => (s.y[i] as number).toFixed(precision)),
    ];
    lines.push(values.join(delimiter));
  }

  return lines.join("\n");
}

/**
 * Export spectrum data to JSON string.
 */
export function spectrumToJson(
  spectrum: Spectrum,
  options: ExportOptions = {},
): string {
  const { xRange, precision = 6 } = options;
  const n = Math.min(spectrum.x.length, spectrum.y.length);

  const x: number[] = [];
  const y: number[] = [];

  for (let i = 0; i < n; i++) {
    const xv = spectrum.x[i] as number;
    if (xRange) {
      const min = Math.min(xRange[0], xRange[1]);
      const max = Math.max(xRange[0], xRange[1]);
      if (xv < min || xv > max) continue;
    }
    x.push(parseFloat(xv.toFixed(precision)));
    y.push(parseFloat((spectrum.y[i] as number).toFixed(precision)));
  }

  return JSON.stringify(
    {
      id: spectrum.id,
      label: spectrum.label,
      xUnit: spectrum.xUnit,
      yUnit: spectrum.yUnit,
      type: spectrum.type,
      x,
      y,
    },
    null,
    2,
  );
}

/**
 * Trigger a file download in the browser.
 */
export function downloadString(
  content: string,
  filename: string,
  mimeType = "text/plain",
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
