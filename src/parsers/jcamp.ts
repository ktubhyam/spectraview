/**
 * JCAMP-DX parser for spectral data.
 *
 * Wraps the `jcampconverter` npm package (optional peer dependency)
 * to parse .dx, .jdx, and .jcamp files into Spectrum objects.
 *
 * If jcampconverter is not installed, a lightweight built-in parser
 * handles basic AFFN (ASCII Free Format Numeric) JCAMP-DX files.
 */

import type { Spectrum, SpectrumType } from "../types";

/**
 * Minimal shape of jcampconverter output (to avoid hard dependency).
 */
interface JcampResult {
  flatten: Array<{
    spectra: Array<{
      data: Array<{
        x: number[];
        y: number[];
      }>;
    }>;
    info: Record<string, string>;
  }>;
}

/** Cached reference to jcampconverter (lazy-loaded). */
let converterModule: { convert: (text: string, options?: object) => JcampResult } | null =
  null;
let converterChecked = false;

/**
 * Attempt to dynamically import jcampconverter.
 *
 * Uses a variable to prevent bundlers from statically analyzing the import,
 * since jcampconverter is an optional peer dependency.
 */
async function getConverter(): Promise<typeof converterModule> {
  if (converterChecked) return converterModule;
  converterChecked = true;
  try {
    // Variable prevents Vite/Webpack static import analysis
    const pkg = "jcampconverter";
    converterModule = await import(/* @vite-ignore */ pkg);
  } catch {
    converterModule = null;
  }
  return converterModule;
}

/**
 * Infer spectrum type from JCAMP-DX header metadata.
 */
function inferType(info: Record<string, string>): SpectrumType {
  const dataType = (info["DATA TYPE"] ?? info["DATATYPE"] ?? "").toLowerCase();
  if (dataType.includes("infrared") || dataType.includes("ir")) return "IR";
  if (dataType.includes("raman")) return "Raman";
  if (dataType.includes("nir") || dataType.includes("near")) return "NIR";
  if (dataType.includes("uv") || dataType.includes("vis")) return "UV-Vis";
  if (dataType.includes("fluor")) return "fluorescence";
  return "other";
}

/**
 * Parse a JCAMP-DX string into Spectrum objects.
 *
 * Uses jcampconverter if available, otherwise falls back to the built-in
 * parser for basic AFFN format files.
 *
 * @param text - Raw JCAMP-DX file content
 * @returns Array of parsed Spectrum objects
 */
export async function parseJcamp(text: string): Promise<Spectrum[]> {
  const converter = await getConverter();
  if (converter) {
    return parseWithConverter(text, converter);
  }
  return [parseBasicJcamp(text)];
}

/**
 * Parse using jcampconverter library.
 */
function parseWithConverter(
  text: string,
  converter: NonNullable<typeof converterModule>,
): Spectrum[] {
  const result = converter.convert(text, { keepRecordsRegExp: /.*/ });

  return result.flatten.map((entry, i) => {
    const firstSpectrum = entry.spectra?.[0]?.data?.[0];
    if (!firstSpectrum) {
      throw new Error(`JCAMP block ${i}: no spectral data found`);
    }

    return {
      id: `jcamp-${Date.now()}-${i}`,
      label: entry.info?.TITLE ?? `Spectrum ${i + 1}`,
      x: new Float64Array(firstSpectrum.x),
      y: new Float64Array(firstSpectrum.y),
      xUnit: entry.info?.XUNITS ?? "cm⁻¹",
      yUnit: entry.info?.YUNITS ?? "Absorbance",
      type: inferType(entry.info),
      meta: entry.info,
    };
  });
}

/**
 * Lightweight built-in JCAMP-DX parser for basic AFFN format.
 *
 * Handles the most common case: single-spectrum files with
 * XYDATA=(X++(Y..Y)) in ASCII free-format.
 *
 * This does NOT support compressed formats (SQZ, DIF, DIFDUP, NTUP)
 * or multi-block files. For full support, install jcampconverter.
 */
function parseBasicJcamp(text: string): Spectrum {
  const lines = text.split(/\r?\n/);
  const info: Record<string, string> = {};
  const xValues: number[] = [];
  const yValues: number[] = [];

  let inData = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Parse labeled data records (##KEY= value)
    if (trimmed.startsWith("##")) {
      const match = trimmed.match(/^##(.+?)=\s*(.*)$/);
      if (match) {
        const key = match[1].trim().toUpperCase();
        const value = match[2].trim();

        if (key === "XYDATA" || key === "XYPOINTS") {
          inData = true;
          continue;
        }
        if (key === "END") {
          inData = false;
          continue;
        }

        info[key] = value;
      }
      continue;
    }

    // Parse data lines
    if (inData && trimmed !== "") {
      const values = trimmed.split(/[\s,]+/).map(Number);
      if (values.length >= 2 && !values.some(isNaN)) {
        // XYDATA: first value is X, rest are Y values
        const x0 = values[0];
        const firstX = parseFloat(info["FIRSTX"] ?? "0");
        const lastX = parseFloat(info["LASTX"] ?? "0");
        const npoints = parseInt(info["NPOINTS"] ?? "0", 10);

        if (npoints > 0 && values.length === 2) {
          // Simple X,Y pair format
          xValues.push(values[0]);
          yValues.push(values[1]);
        } else if (values.length > 1) {
          // X++(Y..Y) format — X is first, rest are Y
          const deltaX =
            npoints > 1 ? (lastX - firstX) / (npoints - 1) : 0;
          for (let j = 1; j < values.length; j++) {
            xValues.push(x0 + (j - 1) * deltaX);
            yValues.push(values[j]);
          }
        }
      }
    }
  }

  if (xValues.length === 0) {
    throw new Error(
      "Failed to parse JCAMP-DX: no data found. Install jcampconverter for full format support.",
    );
  }

  return {
    id: `jcamp-${Date.now()}`,
    label: info["TITLE"] ?? "JCAMP Spectrum",
    x: new Float64Array(xValues),
    y: new Float64Array(yValues),
    xUnit: info["XUNITS"] ?? "cm⁻¹",
    yUnit: info["YUNITS"] ?? "Absorbance",
    type: inferType(info),
    meta: info,
  };
}
