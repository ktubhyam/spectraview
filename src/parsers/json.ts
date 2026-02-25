/**
 * JSON parser for spectral data.
 *
 * Supports multiple JSON formats commonly used for spectral data exchange.
 */

import type { Spectrum, SpectrumType } from "../types";

/**
 * JSON spectrum format: object with x and y arrays.
 *
 * Accepts objects like:
 * ```json
 * {
 *   "label": "My Spectrum",
 *   "x": [4000, 3999, ...],
 *   "y": [0.1, 0.12, ...],
 *   "xUnit": "cm⁻¹",
 *   "yUnit": "Absorbance"
 * }
 * ```
 *
 * Also accepts arrays of such objects for multi-spectrum data.
 */
interface JsonSpectrumInput {
  label?: string;
  title?: string;
  name?: string;
  x: number[];
  y: number[];
  wavenumbers?: number[];
  wavelengths?: number[];
  intensities?: number[];
  absorbance?: number[];
  xUnit?: string;
  yUnit?: string;
  type?: SpectrumType;
  meta?: Record<string, string | number>;
}

/**
 * Parse a JSON string into one or more Spectrum objects.
 *
 * Handles both single spectrum objects and arrays of spectra.
 * Supports flexible key names (x/wavenumbers, y/intensities, etc.).
 *
 * @param text - Raw JSON string
 * @returns Array of parsed Spectrum objects
 * @throws Error if the JSON cannot be parsed or has invalid structure
 */
export function parseJson(text: string): Spectrum[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON: failed to parse input");
  }

  if (Array.isArray(data)) {
    return data.map((item, i) => parseSingleJson(item as JsonSpectrumInput, i));
  }

  if (typeof data === "object" && data !== null) {
    // Check if it's a wrapper object with a "spectra" array
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.spectra)) {
      return (obj.spectra as JsonSpectrumInput[]).map((item, i) =>
        parseSingleJson(item, i),
      );
    }
    return [parseSingleJson(data as JsonSpectrumInput, 0)];
  }

  throw new Error("Invalid JSON structure: expected an object or array");
}

/**
 * Parse a single JSON object into a Spectrum.
 */
function parseSingleJson(input: JsonSpectrumInput, index: number): Spectrum {
  // Resolve x values from various key names
  const xRaw = input.x ?? input.wavenumbers ?? input.wavelengths;
  if (!xRaw || !Array.isArray(xRaw)) {
    throw new Error(
      `Spectrum ${index}: missing x-axis data (expected "x", "wavenumbers", or "wavelengths")`,
    );
  }

  // Resolve y values from various key names
  const yRaw = input.y ?? input.intensities ?? input.absorbance;
  if (!yRaw || !Array.isArray(yRaw)) {
    throw new Error(
      `Spectrum ${index}: missing y-axis data (expected "y", "intensities", or "absorbance")`,
    );
  }

  if (xRaw.length !== yRaw.length) {
    throw new Error(
      `Spectrum ${index}: x and y arrays must have the same length (got ${xRaw.length} and ${yRaw.length})`,
    );
  }

  const label = input.label ?? input.title ?? input.name ?? `Spectrum ${index + 1}`;

  return {
    id: `json-${Date.now()}-${index}`,
    label,
    x: new Float64Array(xRaw),
    y: new Float64Array(yRaw),
    xUnit: input.xUnit,
    yUnit: input.yUnit,
    type: input.type,
    meta: input.meta,
  };
}
