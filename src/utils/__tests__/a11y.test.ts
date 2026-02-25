import { describe, it, expect, vi } from "vitest";
import {
  prefersReducedMotion,
  generateChartDescription,
  KEYBOARD_SHORTCUTS,
} from "../a11y";

describe("generateChartDescription", () => {
  it("returns empty description for zero spectra", () => {
    expect(generateChartDescription(0, "Wavenumber", "Absorbance")).toBe(
      "Empty spectrum viewer",
    );
  });

  it("uses singular for one spectrum", () => {
    const desc = generateChartDescription(1, "Wavenumber", "Absorbance");
    expect(desc).toContain("1 spectrum");
    expect(desc).not.toContain("spectra");
  });

  it("uses plural for multiple spectra", () => {
    const desc = generateChartDescription(3, "Wavenumber", "Absorbance");
    expect(desc).toContain("3 spectra");
  });

  it("includes axis labels", () => {
    const desc = generateChartDescription(2, "Wavenumber (cm⁻¹)", "Transmittance (%)");
    expect(desc).toContain("Wavenumber (cm⁻¹)");
    expect(desc).toContain("Transmittance (%)");
  });

  it("includes keyboard instructions", () => {
    const desc = generateChartDescription(1, "x", "y");
    expect(desc).toContain("zoom");
    expect(desc).toContain("Escape");
  });
});

describe("prefersReducedMotion", () => {
  it("returns false when window is undefined (SSR)", () => {
    const origWindow = globalThis.window;
    // @ts-expect-error — testing SSR environment
    delete globalThis.window;
    expect(prefersReducedMotion()).toBe(false);
    globalThis.window = origWindow;
  });

  it("returns true when prefers-reduced-motion matches", () => {
    const matchMediaSpy = vi.fn().mockReturnValue({ matches: true });
    vi.stubGlobal("matchMedia", matchMediaSpy);
    expect(prefersReducedMotion()).toBe(true);
    vi.unstubAllGlobals();
  });

  it("returns false when prefers-reduced-motion does not match", () => {
    const matchMediaSpy = vi.fn().mockReturnValue({ matches: false });
    vi.stubGlobal("matchMedia", matchMediaSpy);
    expect(prefersReducedMotion()).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe("KEYBOARD_SHORTCUTS", () => {
  it("defines all expected shortcut keys", () => {
    expect(KEYBOARD_SHORTCUTS.ZOOM_IN).toBe("+");
    expect(KEYBOARD_SHORTCUTS.ZOOM_OUT).toBe("-");
    expect(KEYBOARD_SHORTCUTS.RESET).toBe("Escape");
    expect(KEYBOARD_SHORTCUTS.PAN_LEFT).toBe("ArrowLeft");
    expect(KEYBOARD_SHORTCUTS.PAN_RIGHT).toBe("ArrowRight");
  });
});
