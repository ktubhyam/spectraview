/**
 * Hook for applying spectral normalization/processing transformations.
 *
 * Takes raw spectra and a normalization mode, returns transformed spectra
 * ready for rendering. All transformations are memoized.
 */

import { useMemo } from "react";
import type { Spectrum } from "../types";
import {
  normalizeMinMax,
  normalizeArea,
  normalizeSNV,
  baselineRubberBand,
  smoothSavitzkyGolay,
  derivative1st,
} from "../utils/processing";

/** Available normalization/processing modes. */
export type NormalizationMode =
  | "none"
  | "min-max"
  | "area"
  | "snv"
  | "baseline"
  | "smooth"
  | "derivative";

export interface UseNormalizationOptions {
  /** Input spectra. */
  spectra: Spectrum[];
  /** Active normalization mode. */
  mode: NormalizationMode;
  /** Smoothing window size (for "smooth" mode). Defaults to 7. */
  smoothWindow?: number;
}

export interface UseNormalizationReturn {
  /** Transformed spectra. */
  spectra: Spectrum[];
  /** Current mode label for display. */
  modeLabel: string;
}

const MODE_LABELS: Record<NormalizationMode, string> = {
  none: "Raw",
  "min-max": "Min-Max",
  area: "Area Normalized",
  snv: "SNV",
  baseline: "Baseline Corrected",
  smooth: "Smoothed",
  derivative: "1st Derivative",
};

function transformSpectrum(
  spectrum: Spectrum,
  mode: NormalizationMode,
  smoothWindow: number,
): Spectrum {
  if (mode === "none") return spectrum;

  let newY: Float64Array;

  switch (mode) {
    case "min-max":
      newY = normalizeMinMax(spectrum.y);
      break;
    case "area":
      newY = normalizeArea(spectrum.x, spectrum.y);
      break;
    case "snv":
      newY = normalizeSNV(spectrum.y);
      break;
    case "baseline":
      newY = baselineRubberBand(spectrum.y);
      break;
    case "smooth":
      newY = smoothSavitzkyGolay(spectrum.y, smoothWindow);
      break;
    case "derivative":
      newY = derivative1st(spectrum.x, spectrum.y);
      break;
    default:
      return spectrum;
  }

  return { ...spectrum, y: newY };
}

export function useNormalization({
  spectra,
  mode,
  smoothWindow = 7,
}: UseNormalizationOptions): UseNormalizationReturn {
  const transformed = useMemo(
    () => spectra.map((s) => transformSpectrum(s, mode, smoothWindow)),
    [spectra, mode, smoothWindow],
  );

  return {
    spectra: transformed,
    modeLabel: MODE_LABELS[mode],
  };
}
