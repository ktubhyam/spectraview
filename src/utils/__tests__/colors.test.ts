import { describe, it, expect } from "vitest";
import {
  getSpectrumColor,
  getThemeColors,
  SPECTRUM_COLORS,
  LIGHT_THEME,
  DARK_THEME,
} from "../colors";

describe("getSpectrumColor", () => {
  it("returns first color for index 0", () => {
    expect(getSpectrumColor(0)).toBe(SPECTRUM_COLORS[0]);
  });

  it("cycles through palette", () => {
    expect(getSpectrumColor(10)).toBe(SPECTRUM_COLORS[0]);
    expect(getSpectrumColor(11)).toBe(SPECTRUM_COLORS[1]);
  });

  it("returns a valid CSS color string", () => {
    const color = getSpectrumColor(0);
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("getThemeColors", () => {
  it("returns light theme for 'light'", () => {
    const colors = getThemeColors("light");
    expect(colors.background).toBe(LIGHT_THEME.background);
  });

  it("returns dark theme for 'dark'", () => {
    const colors = getThemeColors("dark");
    expect(colors.background).toBe(DARK_THEME.background);
  });

  it("has all required color keys", () => {
    const colors = getThemeColors("light");
    expect(colors).toHaveProperty("background");
    expect(colors).toHaveProperty("axisColor");
    expect(colors).toHaveProperty("gridColor");
    expect(colors).toHaveProperty("tickColor");
    expect(colors).toHaveProperty("labelColor");
    expect(colors).toHaveProperty("crosshairColor");
    expect(colors).toHaveProperty("regionFill");
    expect(colors).toHaveProperty("regionStroke");
    expect(colors).toHaveProperty("tooltipBg");
    expect(colors).toHaveProperty("tooltipBorder");
    expect(colors).toHaveProperty("tooltipText");
  });
});
