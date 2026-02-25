import { describe, it, expect } from "vitest";
import { parseJcamp } from "../jcamp";

const SAMPLE_JCAMP = `##TITLE= Test IR Spectrum
##JCAMP-DX= 4.24
##DATA TYPE= INFRARED SPECTRUM
##XUNITS= 1/CM
##YUNITS= ABSORBANCE
##FIRSTX= 400
##LASTX= 4000
##NPOINTS= 5
##XYDATA= (X++(Y..Y))
400, 0.1
1300, 0.5
2200, 0.3
3100, 0.8
4000, 0.2
##END=
`;

describe("parseJcamp", () => {
  it("parses basic JCAMP-DX file", async () => {
    const result = await parseJcamp(SAMPLE_JCAMP);

    expect(result.length).toBe(1);
    expect(result[0].label).toBe("Test IR Spectrum");
    expect(result[0].xUnit).toBe("1/CM");
    expect(result[0].yUnit).toBe("ABSORBANCE");
    expect(result[0].type).toBe("IR");
  });

  it("extracts correct data points", async () => {
    const result = await parseJcamp(SAMPLE_JCAMP);
    const spectrum = result[0];

    expect(spectrum.x.length).toBe(5);
    expect(spectrum.y.length).toBe(5);
    expect(spectrum.x[0]).toBe(400);
    expect(spectrum.y[0]).toBeCloseTo(0.1);
    expect(spectrum.y[3]).toBeCloseTo(0.8);
  });

  it("stores metadata in meta field", async () => {
    const result = await parseJcamp(SAMPLE_JCAMP);
    expect(result[0].meta?.["TITLE"]).toBe("Test IR Spectrum");
    expect(result[0].meta?.["JCAMP-DX"]).toBe("4.24");
  });

  it("returns Float64Array for x and y", async () => {
    const result = await parseJcamp(SAMPLE_JCAMP);
    expect(result[0].x).toBeInstanceOf(Float64Array);
    expect(result[0].y).toBeInstanceOf(Float64Array);
  });

  it("detects Raman spectrum type", async () => {
    const ramanJcamp = SAMPLE_JCAMP.replace("INFRARED SPECTRUM", "RAMAN SPECTRUM");
    const result = await parseJcamp(ramanJcamp);
    expect(result[0].type).toBe("Raman");
  });

  it("throws on empty data", async () => {
    const empty = "##TITLE= Empty\n##END=\n";
    await expect(parseJcamp(empty)).rejects.toThrow();
  });
});
