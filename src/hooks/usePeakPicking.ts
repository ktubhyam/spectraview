/**
 * Hook for automatic peak detection in spectral data.
 *
 * Wraps the peak detection algorithm with React state management
 * and recalculates when spectra or options change.
 */

import { useMemo } from "react";
import type { Spectrum, Peak } from "../types";
import { detectPeaks, type PeakDetectionOptions } from "../utils/peaks";

export interface UsePeakPickingOptions extends PeakDetectionOptions {
  /** Whether peak picking is enabled. */
  enabled?: boolean;
  /** Only detect peaks for these spectrum IDs (all if not specified). */
  spectrumIds?: string[];
}

/**
 * Automatically detect peaks across one or more spectra.
 *
 * @param spectra - Array of spectra to analyze
 * @param options - Peak detection configuration
 * @returns Array of detected peaks with associated spectrum IDs
 */
export function usePeakPicking(
  spectra: Spectrum[],
  options: UsePeakPickingOptions = {},
): Peak[] {
  const {
    enabled = true,
    spectrumIds,
    prominence,
    minDistance,
    maxPeaks,
  } = options;

  return useMemo(() => {
    if (!enabled) return [];

    const targetSpectra = spectrumIds
      ? spectra.filter((s) => spectrumIds.includes(s.id))
      : spectra;

    const allPeaks: Peak[] = [];

    for (const spectrum of targetSpectra) {
      if (spectrum.visible === false) continue;

      const peaks = detectPeaks(spectrum.x, spectrum.y, {
        prominence,
        minDistance,
        maxPeaks,
      });

      for (const peak of peaks) {
        allPeaks.push({
          ...peak,
          spectrumId: spectrum.id,
        });
      }
    }

    return allPeaks;
  }, [spectra, enabled, spectrumIds, prominence, minDistance, maxPeaks]);
}
