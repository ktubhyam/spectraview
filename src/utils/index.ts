/**
 * Utility modules for scales, rendering, peak detection, and colors.
 *
 * @module utils
 */

export {
  computeXExtent,
  computeYExtent,
  createXScale,
  createYScale,
} from "./scales";

export { detectPeaks } from "./peaks";
export type { PeakDetectionOptions } from "./peaks";

export {
  clearCanvas,
  drawSpectrum,
  drawAllSpectra,
} from "./rendering";

export {
  SPECTRUM_COLORS,
  LIGHT_THEME,
  DARK_THEME,
  getSpectrumColor,
  getThemeColors,
} from "./colors";
export type { ThemeColors } from "./colors";
