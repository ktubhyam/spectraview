/**
 * React hooks for zoom/pan, peak detection, data loading, and export.
 *
 * @module hooks
 */

export { useZoomPan } from "./useZoomPan";
export type { UseZoomPanOptions, UseZoomPanReturn, ZoomPanState } from "./useZoomPan";

export { usePeakPicking } from "./usePeakPicking";
export type { UsePeakPickingOptions } from "./usePeakPicking";

export { useSpectrumData } from "./useSpectrumData";
export type { UseSpectrumDataReturn } from "./useSpectrumData";

export { useExport } from "./useExport";
export type { UseExportReturn } from "./useExport";

export { useRegionSelect } from "./useRegionSelect";
export type { UseRegionSelectOptions, UseRegionSelectReturn } from "./useRegionSelect";

export { useResizeObserver } from "./useResizeObserver";

export { useKeyboardNavigation } from "./useKeyboardNavigation";
export type { UseKeyboardNavigationOptions } from "./useKeyboardNavigation";

export { useNormalization } from "./useNormalization";
export type {
  NormalizationMode,
  UseNormalizationOptions,
  UseNormalizationReturn,
} from "./useNormalization";

export { useHistory } from "./useHistory";
export type { UseHistoryOptions, UseHistoryReturn } from "./useHistory";
