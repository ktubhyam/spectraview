/**
 * Accessibility utilities for SpectraView.
 *
 * Provides helpers for reduced motion detection, ARIA label generation,
 * and keyboard navigation constants.
 */

/** Check if the user prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Generate an accessible description for a spectrum chart. */
export function generateChartDescription(
  spectrumCount: number,
  xLabel: string,
  yLabel: string,
): string {
  if (spectrumCount === 0) return "Empty spectrum viewer";
  const plural = spectrumCount === 1 ? "spectrum" : "spectra";
  return `Interactive spectrum viewer showing ${spectrumCount} ${plural}. X-axis: ${xLabel}. Y-axis: ${yLabel}. Use arrow keys to pan, +/- to zoom, Escape to reset.`;
}

/** Keyboard shortcut definitions. */
export const KEYBOARD_SHORTCUTS = {
  PAN_LEFT: "ArrowLeft",
  PAN_RIGHT: "ArrowRight",
  PAN_UP: "ArrowUp",
  PAN_DOWN: "ArrowDown",
  ZOOM_IN: "+",
  ZOOM_IN_ALT: "=",
  ZOOM_OUT: "-",
  RESET: "Escape",
  NEXT_PEAK: "Tab",
  PREV_PEAK: "Shift+Tab",
} as const;
