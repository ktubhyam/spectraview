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
export { Legend } from "./components/Legend/Legend";
export { DropZone } from "./components/DropZone/DropZone";
export { AnnotationLayer } from "./components/AnnotationLayer/AnnotationLayer";

// Hooks
export { useZoomPan } from "./hooks/useZoomPan";
export { usePeakPicking } from "./hooks/usePeakPicking";
export { useSpectrumData } from "./hooks/useSpectrumData";
export { useExport } from "./hooks/useExport";
export { useRegionSelect } from "./hooks/useRegionSelect";
export { useResizeObserver } from "./hooks/useResizeObserver";
export { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
export { StackedView } from "./components/StackedView/StackedView";
export { ExportMenu } from "./components/ExportMenu/ExportMenu";
export { generateSvg, downloadSvg, LINE_DASH_PATTERNS } from "./utils/svg-export";
export {
  prefersReducedMotion,
  generateChartDescription,
  KEYBOARD_SHORTCUTS,
} from "./utils/a11y";
export { binarySearchClosest, snapToNearestSpectrum } from "./utils/snap";
export { lttbDownsample } from "./utils/lttb";

// Parsers
export { parseJcamp } from "./parsers/jcamp";
export { parseCsv, parseCsvMulti } from "./parsers/csv";
export { parseJson } from "./parsers/json";
export { parseSpc } from "./parsers/spc";

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
  Annotation,
  ViewState,
  Theme,
  DisplayMode,
  Margin,
  LineStyle,
  LegendPosition,
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
export type { CrosshairPosition, CrosshairProps } from "./components/Crosshair/Crosshair";
export type { LegendProps } from "./components/Legend/Legend";
export type { DropZoneProps } from "./components/DropZone/DropZone";
export type { AnnotationLayerProps } from "./components/AnnotationLayer/AnnotationLayer";
export type { SnapResult } from "./utils/snap";
export type { LTTBPoint } from "./utils/lttb";
export type { SnapPoint } from "./components/Crosshair/Crosshair";
export type { UseRegionSelectOptions, UseRegionSelectReturn } from "./hooks/useRegionSelect";
export type { UseKeyboardNavigationOptions } from "./hooks/useKeyboardNavigation";
export type { ExportMenuProps } from "./components/ExportMenu/ExportMenu";
export type { SvgExportOptions } from "./utils/svg-export";
