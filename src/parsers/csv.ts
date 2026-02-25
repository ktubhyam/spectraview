/**
 * CSV/TSV parser for spectral data.
 *
 * Handles comma, tab, and semicolon delimiters with automatic detection.
 * Supports files with or without header rows.
 */

import type { Spectrum } from "../types";

/** Auto-incrementing ID counter for unique spectrum IDs. */
let idCounter = 0;

export interface CsvParseOptions {
  /** Column delimiter (auto-detected if not provided). */
  delimiter?: string;
  /** Zero-based index of the x-value column. */
  xColumn?: number;
  /** Zero-based index of the y-value column. */
  yColumn?: number;
  /** Whether the first row is a header. */
  hasHeader?: boolean;
  /** Label for the parsed spectrum. */
  label?: string;
}

/** Delimiters to try during auto-detection. */
const DELIMITER_CANDIDATES = ["\t", ",", ";", " "] as const;

/**
 * Auto-detect the delimiter used in a CSV text.
 *
 * Counts occurrences of each candidate delimiter in the first 5 lines
 * and picks the one that appears most consistently.
 */
function detectDelimiter(text: string): string {
  const lines = text.trim().split(/\r?\n/).slice(0, 5);
  let bestDelimiter = ",";
  let bestScore = 0;

  for (const d of DELIMITER_CANDIDATES) {
    const counts = lines.map((line) => line.split(d).length - 1);
    const minCount = Math.min(...counts);
    // A good delimiter appears consistently across all lines
    if (minCount > 0 && minCount >= bestScore) {
      const consistent = counts.every((c) => c === counts[0]);
      if (consistent || minCount > bestScore) {
        bestScore = minCount;
        bestDelimiter = d;
      }
    }
  }

  return bestDelimiter;
}

/**
 * Parse a CSV/TSV string into a Spectrum object.
 *
 * @param text - Raw CSV/TSV text content
 * @param options - Parsing configuration
 * @returns Parsed Spectrum
 * @throws Error if the data cannot be parsed
 */
export function parseCsv(text: string, options: CsvParseOptions = {}): Spectrum {
  const {
    xColumn = 0,
    yColumn = 1,
    hasHeader = true,
    label = "CSV Spectrum",
  } = options;

  const delimiter = options.delimiter ?? detectDelimiter(text);
  const lines = text.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error("CSV file must contain at least 2 lines");
  }

  let headerLabel = label;
  let startIndex = 0;

  if (hasHeader) {
    const headers = lines[0].split(delimiter).map((h) => h.trim());
    // Only use header as label if no explicit label was provided
    if (!options.label && headers[yColumn]) {
      headerLabel = headers[yColumn];
    }
    startIndex = 1;
  }

  const xValues: number[] = [];
  const yValues: number[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.startsWith("#")) continue;

    const parts = line.split(delimiter);
    const xVal = parseFloat(parts[xColumn]);
    const yVal = parseFloat(parts[yColumn]);

    if (!isNaN(xVal) && !isNaN(yVal)) {
      xValues.push(xVal);
      yValues.push(yVal);
    }
  }

  if (xValues.length === 0) {
    throw new Error("No valid numeric data found in CSV");
  }

  return {
    id: `csv-${++idCounter}`,
    label: headerLabel,
    x: new Float64Array(xValues),
    y: new Float64Array(yValues),
  };
}

/**
 * Parse a CSV string containing multiple y-columns into multiple spectra.
 *
 * The first column is treated as x-values, and each subsequent column
 * becomes a separate spectrum.
 */
export function parseCsvMulti(
  text: string,
  options: Omit<CsvParseOptions, "xColumn" | "yColumn"> = {},
): Spectrum[] {
  const { hasHeader = true, label } = options;
  const delimiter = options.delimiter ?? detectDelimiter(text);
  const lines = text.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error("CSV file must contain at least 2 lines");
  }

  const firstDataLine = lines[hasHeader ? 1 : 0];
  const numColumns = firstDataLine.split(delimiter).length;

  if (numColumns < 2) {
    throw new Error("CSV must have at least 2 columns (x + y)");
  }

  let headers: string[] | undefined;
  let startIndex = 0;

  if (hasHeader) {
    headers = lines[0].split(delimiter).map((h) => h.trim());
    startIndex = 1;
  }

  const xValues: number[] = [];
  const yArrays: number[][] = Array.from({ length: numColumns - 1 }, () => []);

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.startsWith("#")) continue;

    const parts = line.split(delimiter);
    const xVal = parseFloat(parts[0]);
    if (isNaN(xVal)) continue;

    xValues.push(xVal);
    for (let col = 1; col < numColumns; col++) {
      const yVal = parseFloat(parts[col]);
      yArrays[col - 1].push(isNaN(yVal) ? 0 : yVal);
    }
  }

  const xArray = new Float64Array(xValues);

  return yArrays.map((yArr, i) => ({
    id: `csv-${++idCounter}`,
    label: label ?? headers?.[i + 1] ?? `Spectrum ${i + 1}`,
    x: xArray,
    y: new Float64Array(yArr),
  }));
}
