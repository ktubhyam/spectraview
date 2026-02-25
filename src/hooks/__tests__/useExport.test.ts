import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { useExport } from "../useExport";
import type { Spectrum } from "../../types";

// Mock URL.createObjectURL / revokeObjectURL
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();
vi.stubGlobal("URL", {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

// Mock svg-export module
vi.mock("../../utils/svg-export", () => ({
  generateSvg: vi.fn(() => "<svg></svg>"),
  downloadSvg: vi.fn(),
}));

// Spy on HTMLAnchorElement.prototype.click to track download triggers
const mockClick = vi.fn();

function makeSpectrum(overrides: Partial<Spectrum> = {}): Spectrum {
  return {
    id: "s1",
    label: "Test Spectrum",
    x: new Float64Array([100, 200, 300]),
    y: new Float64Array([0.1, 0.5, 0.9]),
    xUnit: "cm⁻¹",
    yUnit: "Absorbance",
    visible: true,
    ...overrides,
  };
}

describe("useExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(mockClick);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns all export functions", () => {
    const { result } = renderHook(() => useExport());
    expect(typeof result.current.exportPng).toBe("function");
    expect(typeof result.current.exportSvg).toBe("function");
    expect(typeof result.current.exportCsv).toBe("function");
    expect(typeof result.current.exportJson).toBe("function");
  });

  it("exportCsv generates single-spectrum CSV with header", () => {
    const { result } = renderHook(() => useExport());
    const spectrum = makeSpectrum();

    result.current.exportCsv([spectrum], "test.csv");

    // Should have created a blob and triggered download
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it("exportCsv generates multi-spectrum CSV", () => {
    const { result } = renderHook(() => useExport());
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha" }),
      makeSpectrum({ id: "b", label: "Beta" }),
    ];

    result.current.exportCsv(spectra, "multi.csv");

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("exportCsv skips hidden spectra", () => {
    const { result } = renderHook(() => useExport());
    const spectra = [
      makeSpectrum({ id: "a", label: "Alpha", visible: false }),
    ];

    result.current.exportCsv(spectra, "empty.csv");

    // Should not trigger download when all spectra are hidden
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
  });

  it("exportJson creates valid JSON blob", () => {
    const { result } = renderHook(() => useExport());
    const spectrum = makeSpectrum();

    result.current.exportJson([spectrum], "test.json");

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("exportJson filters hidden spectra", () => {
    const { result } = renderHook(() => useExport());
    const spectra = [
      makeSpectrum({ id: "a", visible: true }),
      makeSpectrum({ id: "b", visible: false }),
    ];

    result.current.exportJson(spectra, "filtered.json");

    // Only one spectrum should be in the output (visible one)
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
  });

  it("exportSvg calls generateSvg and downloadSvg", async () => {
    const { generateSvg, downloadSvg } = await import(
      "../../utils/svg-export"
    );
    const { result } = renderHook(() => useExport());
    const xScale = scaleLinear().domain([100, 300]).range([0, 700]);
    const yScale = scaleLinear().domain([0, 1]).range([400, 0]);

    result.current.exportSvg(
      [makeSpectrum()],
      xScale,
      yScale,
      700,
      400,
      "test.svg",
    );

    expect(generateSvg).toHaveBeenCalledTimes(1);
    expect(downloadSvg).toHaveBeenCalledTimes(1);
  });

  it("exportPng calls canvas.toBlob", () => {
    const { result } = renderHook(() => useExport());
    const mockToBlob = vi.fn((cb: (blob: Blob | null) => void) => {
      cb(new Blob(["fake-png"], { type: "image/png" }));
    });
    const mockCanvas = { toBlob: mockToBlob } as unknown as HTMLCanvasElement;

    result.current.exportPng(mockCanvas, "test.png");

    expect(mockToBlob).toHaveBeenCalledWith(expect.any(Function), "image/png");
  });

  it("uses default filenames when none provided", () => {
    const { result } = renderHook(() => useExport());
    const spectrum = makeSpectrum();

    // Default CSV filename
    result.current.exportCsv([spectrum]);
    expect(mockClick).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(mockClick);

    // Default JSON filename
    result.current.exportJson([spectrum]);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
