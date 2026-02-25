import { describe, it, expect } from "vitest";
import { parseJson } from "../json";

describe("parseJson", () => {
  it("parses a single spectrum object", () => {
    const json = JSON.stringify({
      label: "Test",
      x: [1, 2, 3],
      y: [10, 20, 30],
      xUnit: "cm⁻¹",
      yUnit: "Absorbance",
    });

    const result = parseJson(json);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe("Test");
    expect(result[0].x).toBeInstanceOf(Float64Array);
    expect(result[0].x.length).toBe(3);
    expect(result[0].xUnit).toBe("cm⁻¹");
  });

  it("parses an array of spectra", () => {
    const json = JSON.stringify([
      { label: "A", x: [1, 2], y: [10, 20] },
      { label: "B", x: [1, 2], y: [30, 40] },
    ]);

    const result = parseJson(json);
    expect(result.length).toBe(2);
    expect(result[0].label).toBe("A");
    expect(result[1].label).toBe("B");
  });

  it("handles wrapper object with spectra array", () => {
    const json = JSON.stringify({
      spectra: [
        { label: "S1", x: [1], y: [2] },
      ],
    });

    const result = parseJson(json);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe("S1");
  });

  it("supports alternative key names (wavenumbers, intensities)", () => {
    const json = JSON.stringify({
      title: "IR Spectrum",
      wavenumbers: [4000, 3000, 2000],
      intensities: [0.1, 0.5, 0.3],
    });

    const result = parseJson(json);
    expect(result[0].label).toBe("IR Spectrum");
    expect(result[0].x.length).toBe(3);
    expect(result[0].x[0]).toBe(4000);
  });

  it("supports wavelengths and absorbance keys", () => {
    const json = JSON.stringify({
      name: "UV-Vis",
      wavelengths: [200, 300, 400],
      absorbance: [0.2, 0.8, 0.3],
    });

    const result = parseJson(json);
    expect(result[0].label).toBe("UV-Vis");
    expect(result[0].y[1]).toBe(0.8);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseJson("not json")).toThrow("Invalid JSON");
  });

  it("throws on missing x data", () => {
    const json = JSON.stringify({ y: [1, 2, 3] });
    expect(() => parseJson(json)).toThrow("missing x-axis data");
  });

  it("throws on missing y data", () => {
    const json = JSON.stringify({ x: [1, 2, 3] });
    expect(() => parseJson(json)).toThrow("missing y-axis data");
  });

  it("throws on mismatched array lengths", () => {
    const json = JSON.stringify({ x: [1, 2, 3], y: [10, 20] });
    expect(() => parseJson(json)).toThrow("same length");
  });

  it("throws on non-object/array JSON", () => {
    expect(() => parseJson('"just a string"')).toThrow("Invalid JSON structure");
  });

  it("preserves metadata", () => {
    const json = JSON.stringify({
      label: "Test",
      x: [1],
      y: [2],
      meta: { source: "lab", temperature: 25 },
    });

    const result = parseJson(json);
    expect(result[0].meta?.source).toBe("lab");
    expect(result[0].meta?.temperature).toBe(25);
  });

  it("assigns default label when none provided", () => {
    const json = JSON.stringify({ x: [1], y: [2] });
    const result = parseJson(json);
    expect(result[0].label).toBe("Spectrum 1");
  });
});
