/**
 * Default color palette for rendering multiple spectra.
 *
 * Colors are chosen for good contrast on both light and dark backgrounds,
 * and are distinguishable for common forms of color blindness.
 */

/** Default spectrum color palette (10 colors). */
export const SPECTRUM_COLORS = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#9333ea", // purple
  "#ea580c", // orange
  "#0891b2", // cyan
  "#be185d", // pink
  "#854d0e", // brown
  "#4f46e5", // indigo
  "#65a30d", // lime
] as const;

/** Theme color definition. */
export interface ThemeColors {
  background: string;
  axisColor: string;
  gridColor: string;
  tickColor: string;
  labelColor: string;
  crosshairColor: string;
  regionFill: string;
  regionStroke: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

/** Light theme colors. */
export const LIGHT_THEME: ThemeColors = {
  background: "#ffffff",
  axisColor: "#374151",
  gridColor: "#e5e7eb",
  tickColor: "#6b7280",
  labelColor: "#111827",
  crosshairColor: "#9ca3af",
  regionFill: "rgba(37, 99, 235, 0.1)",
  regionStroke: "rgba(37, 99, 235, 0.4)",
  tooltipBg: "#ffffff",
  tooltipBorder: "#d1d5db",
  tooltipText: "#111827",
};

/** Dark theme colors. */
export const DARK_THEME: ThemeColors = {
  background: "#111827",
  axisColor: "#d1d5db",
  gridColor: "#374151",
  tickColor: "#9ca3af",
  labelColor: "#f9fafb",
  crosshairColor: "#6b7280",
  regionFill: "rgba(96, 165, 250, 0.15)",
  regionStroke: "rgba(96, 165, 250, 0.5)",
  tooltipBg: "#1f2937",
  tooltipBorder: "#4b5563",
  tooltipText: "#f9fafb",
};

/**
 * Get the color for a spectrum at the given index.
 *
 * Cycles through the palette if index exceeds palette length.
 */
export function getSpectrumColor(index: number): string {
  return SPECTRUM_COLORS[index % SPECTRUM_COLORS.length];
}

/**
 * Get theme colors for the given theme name.
 */
export function getThemeColors(theme: "light" | "dark"): ThemeColors {
  return theme === "dark" ? DARK_THEME : LIGHT_THEME;
}
