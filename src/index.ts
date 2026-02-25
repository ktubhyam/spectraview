/**
 * SpectraView — Interactive React component for vibrational spectroscopy.
 *
 * @example
 * ```tsx
 * import { SpectraView, parseCsv } from "spectraview";
 *
 * const spectrum = parseCsv(csvText);
 * <SpectraView spectra={[spectrum]} reverseX />
 * ```
 *
 * @packageDocumentation
 */

// Main component
export { SpectraView } from "./components/SpectraView/SpectraView";

// Sub-components (for advanced composition)
export { SpectrumCanvas } from "./components/SpectrumCanvas/SpectrumCanvas";
export { AxisLayer } from "./components/AxisLayer/AxisLayer";
export { PeakMarkers } from "./components/PeakMarkers/PeakMarkers";
export { RegionSelector } from "./components/RegionSelector/RegionSelector";
export { Crosshair } from "./components/Crosshair/Crosshair";
export { Toolbar } from "./components/Toolbar/Toolbar";

// Hooks
export { useZoomPan } from "./hooks/useZoomPan";
export { usePeakPicking } from "./hooks/usePeakPicking";
export { useSpectrumData } from "./hooks/useSpectrumData";
export { useExport } from "./hooks/useExport";

// Parsers
export { parseJcamp } from "./parsers/jcamp";
export { parseCsv, parseCsvMulti } from "./parsers/csv";
export { parseJson } from "./parsers/json";

// Utilities
export { detectPeaks } from "./utils/peaks";
export {
  computeXExtent,
  computeYExtent,
  createXScale,
  createYScale,
} from "./utils/scales";
export {
  SPECTRUM_COLORS,
  LIGHT_THEME,
  DARK_THEME,
  getSpectrumColor,
  getThemeColors,
} from "./utils/colors";

// Types (re-export all)
export type {
  Spectrum,
  SpectrumType,
  Peak,
  Region,
  ViewState,
  Theme,
  DisplayMode,
  Margin,
  SpectraViewProps,
  ResolvedConfig,
} from "./types";

export type { CsvParseOptions } from "./parsers/csv";
export type { PeakDetectionOptions } from "./utils/peaks";
export type {
  UseZoomPanOptions,
  UseZoomPanReturn,
  ZoomPanState,
} from "./hooks/useZoomPan";
export type { UsePeakPickingOptions } from "./hooks/usePeakPicking";
export type { UseSpectrumDataReturn } from "./hooks/useSpectrumData";
export type { UseExportReturn } from "./hooks/useExport";
