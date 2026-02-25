import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpectrumData } from "../useSpectrumData";
import { createTestSpectrum, createTestSpectrum2 } from "../../test/helpers";

/**
 * Create a File-like object whose .text() works in jsdom.
 * jsdom's File constructor doesn't always implement Blob.prototype.text(),
 * so we build from a Blob and attach the `name` property.
 */
function createFile(content: string, name: string, type: string): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  // jsdom's File.text() is broken — unconditionally override
  (file as unknown as Record<string, unknown>).text = () =>
    Promise.resolve(content);
  return file;
}

describe("useSpectrumData", () => {
  it("initializes with empty spectra", () => {
    const { result } = renderHook(() => useSpectrumData());

    expect(result.current.spectra).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("initializes with provided initial spectra", () => {
    const s1 = createTestSpectrum();
    const s2 = createTestSpectrum2();
    const { result } = renderHook(() => useSpectrumData([s1, s2]));

    expect(result.current.spectra).toHaveLength(2);
    expect(result.current.spectra[0].id).toBe(s1.id);
    expect(result.current.spectra[1].id).toBe(s2.id);
  });

  it("addSpectrum adds to array", () => {
    const { result } = renderHook(() => useSpectrumData());
    const spectrum = createTestSpectrum();

    act(() => {
      result.current.addSpectrum(spectrum);
    });

    expect(result.current.spectra).toHaveLength(1);
    expect(result.current.spectra[0].id).toBe(spectrum.id);
  });

  it("removeSpectrum removes by ID", () => {
    const s1 = createTestSpectrum();
    const s2 = createTestSpectrum2();
    const { result } = renderHook(() => useSpectrumData([s1, s2]));

    act(() => {
      result.current.removeSpectrum(s1.id);
    });

    expect(result.current.spectra).toHaveLength(1);
    expect(result.current.spectra[0].id).toBe(s2.id);
  });

  it("toggleVisibility flips visible flag", () => {
    const spectrum = createTestSpectrum({ visible: true });
    const { result } = renderHook(() => useSpectrumData([spectrum]));

    // Toggle off
    act(() => {
      result.current.toggleVisibility(spectrum.id);
    });
    expect(result.current.spectra[0].visible).toBe(false);

    // Toggle back on
    act(() => {
      result.current.toggleVisibility(spectrum.id);
    });
    expect(result.current.spectra[0].visible).toBe(true);
  });

  it("clear removes all spectra and errors", async () => {
    const s1 = createTestSpectrum();
    const { result } = renderHook(() => useSpectrumData([s1]));

    // Force an error by loading invalid data
    await act(async () => {
      await result.current.loadText("not valid csv", "csv");
    });
    expect(result.current.error).not.toBeNull();

    // Now clear everything
    act(() => {
      result.current.clear();
    });

    expect(result.current.spectra).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('loadText with "csv" format adds spectrum', async () => {
    const { result } = renderHook(() => useSpectrumData());
    const csvText = "wavenumber,absorbance\n1000,0.5\n2000,0.8\n3000,0.3\n";

    await act(async () => {
      await result.current.loadText(csvText, "csv");
    });

    expect(result.current.error).toBeNull();
    expect(result.current.spectra).toHaveLength(1);
    expect(result.current.spectra[0].x.length).toBe(3);
    expect(result.current.loading).toBe(false);
  });

  it('loadText with "json" format adds spectrum', async () => {
    const { result } = renderHook(() => useSpectrumData());
    const jsonText = JSON.stringify({
      label: "JSON Test",
      x: [1000, 2000, 3000],
      y: [0.5, 0.8, 0.3],
    });

    await act(async () => {
      await result.current.loadText(jsonText, "json");
    });

    expect(result.current.error).toBeNull();
    expect(result.current.spectra).toHaveLength(1);
    expect(result.current.spectra[0].label).toBe("JSON Test");
    expect(result.current.loading).toBe(false);
  });

  it("loadText sets error on invalid data", async () => {
    const { result } = renderHook(() => useSpectrumData());

    await act(async () => {
      await result.current.loadText("totally invalid {{{", "json");
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.spectra).toHaveLength(0);
    expect(result.current.loading).toBe(false);
  });

  it("loadFile detects format from .csv extension", async () => {
    const { result } = renderHook(() => useSpectrumData());
    const csvContent = "wavenumber,absorbance\n1000,0.5\n2000,0.8\n3000,0.3\n";
    const file = createFile(csvContent, "spectrum.csv", "text/csv");

    await act(async () => {
      await result.current.loadFile(file);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.spectra).toHaveLength(1);
    expect(result.current.spectra[0].x.length).toBe(3);
  });

  it("loadFile rejects unsupported extensions", async () => {
    const { result } = renderHook(() => useSpectrumData());
    const file = createFile("data", "spectrum.xyz", "application/octet-stream");

    await act(async () => {
      await result.current.loadFile(file);
    });

    expect(result.current.error).toMatch(/unsupported/i);
    expect(result.current.spectra).toHaveLength(0);
  });
});
