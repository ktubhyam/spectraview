import { describe, it, expect } from "vitest";
import { parseCsv, parseCsvMulti } from "../csv";

describe("parseCsv", () => {
  it("parses basic CSV with header", () => {
    const text = "wavenumber,absorbance\n4000,0.1\n3500,0.3\n3000,0.8";
    const result = parseCsv(text);

    expect(result.x).toBeInstanceOf(Float64Array);
    expect(result.y).toBeInstanceOf(Float64Array);
    expect(result.x.length).toBe(3);
    expect(result.x[0]).toBe(4000);
    expect(result.y[2]).toBe(0.8);
    expect(result.label).toBe("absorbance");
  });

  it("parses TSV with auto-detection", () => {
    const text = "wavenumber\tintensity\n1000\t5.5\n2000\t3.2";
    const result = parseCsv(text);

    expect(result.x.length).toBe(2);
    expect(result.x[0]).toBe(1000);
    expect(result.y[1]).toBe(3.2);
  });

  it("parses CSV without header", () => {
    const text = "4000,0.1\n3500,0.3";
    const result = parseCsv(text, { hasHeader: false });

    expect(result.x.length).toBe(2);
    expect(result.x[0]).toBe(4000);
  });

  it("skips comment lines and blank lines", () => {
    const text = "x,y\n# comment\n100,1\n\n200,2\n";
    const result = parseCsv(text);

    expect(result.x.length).toBe(2);
  });

  it("uses custom delimiter", () => {
    const text = "x;y\n1;10\n2;20";
    const result = parseCsv(text, { delimiter: ";" });

    expect(result.x[0]).toBe(1);
    expect(result.y[1]).toBe(20);
  });

  it("throws on empty file", () => {
    expect(() => parseCsv("")).toThrow();
  });

  it("throws on file with no numeric data", () => {
    const text = "header1,header2\nabc,def";
    expect(() => parseCsv(text)).toThrow("No valid numeric data");
  });

  it("uses custom label", () => {
    const text = "x,y\n1,2";
    const result = parseCsv(text, { label: "My Spectrum" });
    expect(result.label).toBe("My Spectrum");
  });

  it("generates Float64Array output", () => {
    const text = "x,y\n1.123456789012,2.987654321098";
    const result = parseCsv(text);
    expect(result.x).toBeInstanceOf(Float64Array);
    // Float64 preserves full precision
    expect(result.x[0]).toBeCloseTo(1.123456789012, 10);
  });
});

describe("parseCsvMulti", () => {
  it("parses multi-column CSV into multiple spectra", () => {
    const text = "x,sample_a,sample_b\n1000,0.5,0.3\n2000,0.8,0.6";
    const result = parseCsvMulti(text);

    expect(result.length).toBe(2);
    expect(result[0].label).toBe("sample_a");
    expect(result[1].label).toBe("sample_b");
    expect(result[0].x[0]).toBe(1000);
    expect(result[1].y[1]).toBe(0.6);
  });

  it("shares x-axis across spectra", () => {
    const text = "x,a,b\n1,10,20\n2,30,40";
    const result = parseCsvMulti(text);

    // Both spectra should reference the same x array
    expect(result[0].x).toBe(result[1].x);
  });

  it("throws on single-column CSV", () => {
    expect(() => parseCsvMulti("x\n1\n2")).toThrow("at least 2 columns");
  });
});
