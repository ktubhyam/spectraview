/**
 * SPC file parser for Thermo/Galactic spectral data format.
 *
 * Parses the binary SPC format used by GRAMS, Thermo Scientific,
 * PerkinElmer, and other spectroscopy software.
 *
 * Supports:
 * - Single and multi-spectrum files
 * - Even and uneven X spacing
 * - 32-bit float and 16-bit integer Y data
 * - File header metadata (resolution, instrument, etc.)
 *
 * Reference: "The New Galactic SPC File Format" specification
 *
 * @module spc
 */

import type { Spectrum, SpectrumType } from "../types";

/** Auto-incrementing ID counter. */
let idCounter = 0;

/** SPC file type flags. */
const TSPREC = 0x01; // Y data is 16-bit integer
const TMULTI = 0x04; // Multi-file (multiple spectra)
const TXVALS = 0x80; // Non-evenly spaced X data present

/** SPC X-axis type codes to units. */
const X_TYPE_LABELS: Record<number, string> = {
  0: "Arbitrary",
  1: "cm⁻¹",
  2: "µm",
  3: "nm",
  4: "s",
  5: "min",
  6: "Hz",
  7: "kHz",
  8: "MHz",
  9: "m/z",
  10: "Da",
  11: "ppm",
  12: "days",
  13: "years",
  14: "Raman shift (cm⁻¹)",
  15: "eV",
  16: "Text label",
  255: "Double interferogram",
};

/** SPC Y-axis type codes to units. */
const Y_TYPE_LABELS: Record<number, string> = {
  0: "Arbitrary",
  1: "Interferogram",
  2: "Absorbance",
  3: "Kubelka-Munk",
  4: "Counts",
  5: "V",
  6: "°",
  7: "mA",
  8: "mm",
  9: "mV",
  10: "log(1/R)",
  11: "%",
  12: "Intensity",
  13: "Relative intensity",
  14: "Energy",
  16: "dB",
  19: "°C",
  20: "°F",
  21: "K",
  22: "Index of refraction [n]",
  23: "Extinction coeff. [k]",
  24: "Real",
  25: "Imaginary",
  26: "Complex",
  128: "Transmittance",
  129: "Reflectance",
  130: "Arbitrary (Valley to peak)",
  131: "Emission",
};

/** Infer SpectrumType from SPC X-type code. */
function inferSpectrumType(xType: number, yType: number): SpectrumType {
  if (xType === 1) return "IR"; // cm⁻¹
  if (xType === 14) return "Raman";
  if (xType === 3 && (yType === 2 || yType === 128)) return "UV-Vis";
  if (xType === 2) return "NIR"; // µm
  if (yType === 131) return "fluorescence";
  return "other";
}

/**
 * Parse an SPC binary file into Spectrum objects.
 *
 * @param buffer - ArrayBuffer containing the SPC file data
 * @returns Array of parsed Spectrum objects
 * @throws Error if the file is not a valid SPC file
 */
export function parseSpc(buffer: ArrayBuffer): Spectrum[] {
  const view = new DataView(buffer);
  const minSize = 512; // SPC header is 512 bytes

  if (buffer.byteLength < minSize) {
    throw new Error("Invalid SPC file: too small for SPC header");
  }

  // Read main file header (512 bytes)
  const flags = view.getUint8(0);
  const fileVersion = view.getUint8(1);

  // Validate version (0x4B = new format, 0x4D = old format)
  if (fileVersion !== 0x4b && fileVersion !== 0x4d) {
    throw new Error(
      `Unsupported SPC version: 0x${fileVersion.toString(16)}. Expected 0x4B or 0x4D.`,
    );
  }

  const xType = view.getUint8(2);
  const yType = view.getUint8(3);
  const npoints = view.getUint32(4, true); // little-endian
  const firstX = view.getFloat64(8, true);
  const lastX = view.getFloat64(16, true);
  const numSpectra = view.getUint32(24, true);

  // Experiment type at offset 28
  const xUnit = X_TYPE_LABELS[xType] ?? "Arbitrary";
  const yUnit = Y_TYPE_LABELS[yType] ?? "Arbitrary";

  // Read memo string (offset 30, 130 bytes max)
  const memoBytes = new Uint8Array(buffer, 30, 130);
  const memo = decodeText(memoBytes);

  const isMulti = (flags & TMULTI) !== 0;
  const hasXValues = (flags & TXVALS) !== 0;
  const is16Bit = (flags & TSPREC) !== 0;
  const specType = inferSpectrumType(xType, yType);

  // Generate evenly-spaced X values if not provided
  let sharedX: Float64Array | null = null;

  if (!hasXValues && npoints > 0) {
    sharedX = new Float64Array(npoints);
    const step = npoints > 1 ? (lastX - firstX) / (npoints - 1) : 0;
    for (let i = 0; i < npoints; i++) {
      sharedX[i] = firstX + i * step;
    }
  }

  const spectra: Spectrum[] = [];
  let offset = 512; // Start after main header

  // Read X values if present (only for non-multi or old format)
  let fileXValues: Float64Array | null = null;
  if (hasXValues && !isMulti) {
    fileXValues = new Float64Array(npoints);
    for (let i = 0; i < npoints; i++) {
      fileXValues[i] = view.getFloat32(offset, true);
      offset += 4;
    }
  }

  const count = isMulti ? numSpectra : 1;

  for (let s = 0; s < count; s++) {
    let xVals: Float64Array;
    let yVals: Float64Array;
    let subNpoints = npoints;

    if (isMulti) {
      // Read sub-file header (32 bytes)
      if (offset + 32 > buffer.byteLength) break;

      // Sub-header fields: flags(1), exp(1), index(2), startX(4), endX(4), npoints(4), ...
      const subStartX = view.getFloat32(offset + 4, true);
      const subEndX = view.getFloat32(offset + 8, true);
      subNpoints = view.getUint32(offset + 12, true) || npoints;
      offset += 32;

      // Sub-file X values
      if (hasXValues) {
        xVals = new Float64Array(subNpoints);
        for (let i = 0; i < subNpoints; i++) {
          if (offset + 4 > buffer.byteLength) break;
          xVals[i] = view.getFloat32(offset, true);
          offset += 4;
        }
      } else if (sharedX) {
        xVals = sharedX;
      } else {
        // Generate from sub-header
        xVals = new Float64Array(subNpoints);
        const step = subNpoints > 1 ? (subEndX - subStartX) / (subNpoints - 1) : 0;
        for (let i = 0; i < subNpoints; i++) {
          xVals[i] = subStartX + i * step;
        }
      }
    } else {
      xVals = fileXValues ?? sharedX ?? new Float64Array(0);
    }

    // Read Y values
    yVals = new Float64Array(subNpoints);

    if (is16Bit) {
      for (let i = 0; i < subNpoints; i++) {
        if (offset + 2 > buffer.byteLength) break;
        yVals[i] = view.getInt16(offset, true);
        offset += 2;
      }
    } else {
      for (let i = 0; i < subNpoints; i++) {
        if (offset + 4 > buffer.byteLength) break;
        yVals[i] = view.getFloat32(offset, true);
        offset += 4;
      }
    }

    spectra.push({
      id: `spc-${++idCounter}`,
      label: memo || `SPC Spectrum ${s + 1}`,
      x: xVals,
      y: yVals,
      xUnit,
      yUnit,
      type: specType,
      meta: {
        format: "SPC",
        version: fileVersion === 0x4b ? "new" : "old",
        xType: xType.toString(),
        yType: yType.toString(),
      },
    });
  }

  if (spectra.length === 0) {
    throw new Error("Invalid SPC file: no spectra found");
  }

  return spectra;
}

/** Decode a null-terminated byte array to string. */
function decodeText(bytes: Uint8Array): string {
  const nullIdx = bytes.indexOf(0);
  const slice = nullIdx >= 0 ? bytes.slice(0, nullIdx) : bytes;
  return new TextDecoder("ascii").decode(slice).trim();
}
