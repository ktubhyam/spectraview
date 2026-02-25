import { describe, it, expect } from "vitest";
import { parseSpc } from "../spc";

/** Create a minimal valid SPC file buffer for testing. */
function createSpcBuffer(options: {
  version?: number;
  flags?: number;
  xType?: number;
  yType?: number;
  npoints?: number;
  firstX?: number;
  lastX?: number;
  numSpectra?: number;
  memo?: string;
  yValues?: number[];
  xValues?: number[];
}): ArrayBuffer {
  const {
    version = 0x4b,
    flags = 0,
    xType = 1,
    yType = 2,
    npoints = 5,
    firstX = 400,
    lastX = 4000,
    numSpectra = 1,
    memo = "Test Spectrum",
    yValues = [0.1, 0.5, 0.8, 0.3, 0.2],
    xValues,
  } = options;

  const hasXValues = (flags & 0x80) !== 0;
  const is16Bit = (flags & 0x01) !== 0;
  const isMulti = (flags & 0x04) !== 0;

  // Calculate buffer size
  let size = 512; // header
  if (hasXValues && !isMulti) size += npoints * 4; // X values
  if (isMulti) {
    for (let s = 0; s < numSpectra; s++) {
      size += 32; // sub-header
      if (hasXValues) size += npoints * 4; // sub X values
      size += npoints * (is16Bit ? 2 : 4); // Y values
    }
  } else {
    size += npoints * (is16Bit ? 2 : 4); // Y values
  }

  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // Write main header
  view.setUint8(0, flags);
  view.setUint8(1, version);
  view.setUint8(2, xType);
  view.setUint8(3, yType);
  view.setUint32(4, npoints, true);
  view.setFloat64(8, firstX, true);
  view.setFloat64(16, lastX, true);
  view.setUint32(24, numSpectra, true);

  // Write memo (offset 30)
  const encoder = new TextEncoder();
  const memoBytes = encoder.encode(memo);
  uint8.set(memoBytes.slice(0, 130), 30);

  let offset = 512;

  // Write X values if present (non-multi)
  if (hasXValues && !isMulti && xValues) {
    for (let i = 0; i < npoints; i++) {
      view.setFloat32(offset, xValues[i] ?? 0, true);
      offset += 4;
    }
  }

  if (isMulti) {
    for (let s = 0; s < numSpectra; s++) {
      // Sub-header (32 bytes)
      view.setUint8(offset, 0); // sub flags
      view.setUint8(offset + 1, 0); // exponent
      view.setUint16(offset + 2, s, true); // index
      view.setFloat32(offset + 4, firstX, true); // startX
      view.setFloat32(offset + 8, lastX, true); // endX
      view.setUint32(offset + 12, npoints, true); // npoints
      offset += 32;

      // Sub X values if present
      if (hasXValues && xValues) {
        for (let i = 0; i < npoints; i++) {
          view.setFloat32(offset, xValues[i] ?? 0, true);
          offset += 4;
        }
      }

      // Y values
      for (let i = 0; i < npoints; i++) {
        const yVal = yValues[i] ?? 0;
        if (is16Bit) {
          view.setInt16(offset, Math.round(yVal), true);
          offset += 2;
        } else {
          view.setFloat32(offset, yVal, true);
          offset += 4;
        }
      }
    }
  } else {
    // Single spectrum Y values
    for (let i = 0; i < npoints; i++) {
      const yVal = yValues[i] ?? 0;
      if (is16Bit) {
        view.setInt16(offset, Math.round(yVal), true);
        offset += 2;
      } else {
        view.setFloat32(offset, yVal, true);
        offset += 4;
      }
    }
  }

  return buffer;
}

describe("parseSpc", () => {
  it("parses a basic single-spectrum SPC file", () => {
    const buffer = createSpcBuffer({});
    const spectra = parseSpc(buffer);

    expect(spectra).toHaveLength(1);
    expect(spectra[0].x).toHaveLength(5);
    expect(spectra[0].y).toHaveLength(5);
    expect(spectra[0].label).toBe("Test Spectrum");
    expect(spectra[0].xUnit).toBe("cm⁻¹");
    expect(spectra[0].yUnit).toBe("Absorbance");
    expect(spectra[0].type).toBe("IR");
  });

  it("generates evenly-spaced X values", () => {
    const buffer = createSpcBuffer({ firstX: 400, lastX: 4000, npoints: 5 });
    const spectra = parseSpc(buffer);

    const x = spectra[0].x;
    expect(x[0]).toBeCloseTo(400, 5);
    expect(x[4]).toBeCloseTo(4000, 5);
    // Check even spacing
    const step = (4000 - 400) / 4;
    expect(x[1]).toBeCloseTo(400 + step, 5);
  });

  it("reads Y values correctly", () => {
    const yValues = [0.1, 0.5, 0.8, 0.3, 0.2];
    const buffer = createSpcBuffer({ yValues });
    const spectra = parseSpc(buffer);

    for (let i = 0; i < yValues.length; i++) {
      expect(spectra[0].y[i]).toBeCloseTo(yValues[i], 3);
    }
  });

  it("handles multi-spectrum files", () => {
    const buffer = createSpcBuffer({
      flags: 0x04, // TMULTI
      numSpectra: 3,
      npoints: 5,
      yValues: [1, 2, 3, 4, 5],
    });
    const spectra = parseSpc(buffer);
    expect(spectra).toHaveLength(3);
  });

  it("reads 16-bit integer Y data", () => {
    const buffer = createSpcBuffer({
      flags: 0x01, // TSPREC (16-bit)
      yValues: [100, 200, 300, 400, 500],
    });
    const spectra = parseSpc(buffer);
    expect(spectra[0].y[0]).toBe(100);
    expect(spectra[0].y[4]).toBe(500);
  });

  it("parses custom X values when TXVALS flag is set", () => {
    const xValues = [500, 1000, 2000, 3000, 3500];
    const buffer = createSpcBuffer({
      flags: 0x80, // TXVALS
      xValues,
    });
    const spectra = parseSpc(buffer);

    for (let i = 0; i < xValues.length; i++) {
      expect(spectra[0].x[i]).toBeCloseTo(xValues[i], 0);
    }
  });

  it("infers Raman spectrum type", () => {
    const buffer = createSpcBuffer({ xType: 14 });
    const spectra = parseSpc(buffer);
    expect(spectra[0].type).toBe("Raman");
    expect(spectra[0].xUnit).toBe("Raman shift (cm⁻¹)");
  });

  it("throws on invalid version", () => {
    const buffer = createSpcBuffer({ version: 0xff });
    expect(() => parseSpc(buffer)).toThrow("Unsupported SPC version");
  });

  it("throws on buffer too small", () => {
    const buffer = new ArrayBuffer(100);
    expect(() => parseSpc(buffer)).toThrow("too small");
  });

  it("includes metadata in output", () => {
    const buffer = createSpcBuffer({});
    const spectra = parseSpc(buffer);
    expect(spectra[0].meta).toBeDefined();
    expect(spectra[0].meta!.format).toBe("SPC");
  });
});
