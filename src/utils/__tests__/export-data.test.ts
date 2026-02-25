import { describe, it, expect } from "vitest";
import { spectrumToCsv, multiSpectraToCsv, spectrumToJson } from "../export-data";
import type { Spectrum } from "../../types";

const spectrum: Spectrum = {
  id: "s1",
  label: "Test",
  x: [100, 200, 300, 400, 500],
  y: [0.1, 0.5, 0.9, 0.3, 0.1],
  xUnit: "cm⁻¹",
  yUnit: "Absorbance",
};

describe("spectrumToCsv", () => {
  it("generates CSV with header", () => {
    const csv = spectrumToCsv(spectrum);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("cm⁻¹,Absorbance");
    expect(lines).toHaveLength(6); // header + 5 data rows
  });

  it("generates CSV without header", () => {
    const csv = spectrumToCsv(spectrum, { includeHeader: false });
    const lines = csv.split("\n");
    expect(lines).toHaveLength(5);
  });

  it("uses custom delimiter", () => {
    const csv = spectrumToCsv(spectrum, { delimiter: "\t" });
    expect(csv).toContain("\t");
  });

  it("filters by xRange", () => {
    const csv = spectrumToCsv(spectrum, { xRange: [200, 400] });
    const lines = csv.split("\n");
    expect(lines).toHaveLength(4); // header + 3 data rows (200, 300, 400)
  });

  it("uses custom precision", () => {
    const csv = spectrumToCsv(spectrum, { precision: 2 });
    expect(csv).toContain("100.00");
    expect(csv).toContain("0.10");
  });
});

describe("multiSpectraToCsv", () => {
  const sp2: Spectrum = { ...spectrum, id: "s2", label: "Sample B", y: [0.2, 0.4, 0.6, 0.4, 0.2] };

  it("generates CSV with multiple Y columns", () => {
    const csv = multiSpectraToCsv([spectrum, sp2]);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Test");
    expect(lines[0]).toContain("Sample B");
    // Each data line should have 3 values (x, y1, y2)
    const dataValues = lines[1].split(",");
    expect(dataValues).toHaveLength(3);
  });

  it("returns empty string for empty array", () => {
    expect(multiSpectraToCsv([])).toBe("");
  });
});

describe("spectrumToJson", () => {
  it("generates valid JSON", () => {
    const json = spectrumToJson(spectrum);
    const parsed = JSON.parse(json);
    expect(parsed.id).toBe("s1");
    expect(parsed.label).toBe("Test");
    expect(parsed.x).toHaveLength(5);
    expect(parsed.y).toHaveLength(5);
  });

  it("filters by xRange", () => {
    const json = spectrumToJson(spectrum, { xRange: [200, 400] });
    const parsed = JSON.parse(json);
    expect(parsed.x).toHaveLength(3);
  });

  it("includes metadata", () => {
    const json = spectrumToJson(spectrum);
    const parsed = JSON.parse(json);
    expect(parsed.xUnit).toBe("cm⁻¹");
    expect(parsed.yUnit).toBe("Absorbance");
  });
});
