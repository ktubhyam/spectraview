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

export { binarySearchClosest, snapToNearestSpectrum } from "./snap";
export type { SnapResult } from "./snap";

export { lttbDownsample } from "./lttb";
export type { LTTBPoint } from "./lttb";

export { generateSvg, downloadSvg, LINE_DASH_PATTERNS } from "./svg-export";
export type { SvgExportOptions } from "./svg-export";

export { prefersReducedMotion, generateChartDescription, KEYBOARD_SHORTCUTS } from "./a11y";

export {
  spectrumToCsv,
  multiSpectraToCsv,
  spectrumToJson,
  downloadString,
} from "./export-data";
export type { ExportOptions } from "./export-data";

export {
  baselineRubberBand,
  normalizeMinMax,
  normalizeArea,
  normalizeSNV,
  smoothSavitzkyGolay,
  derivative1st,
  derivative2nd,
} from "./processing";

export {
  differenceSpectrum,
  addSpectra,
  scaleSpectrum,
  correlationCoefficient,
  residualSpectrum,
  interpolateToGrid,
} from "./comparison";
