/**
 * Hook for interactive region selection via Shift+drag.
 *
 * Tracks mouse drag state when Shift is held, converting pixel
 * coordinates to data-space values using the provided x-scale.
 */

import { useCallback, useRef, useState } from "react";
import type { ScaleLinear } from "d3-scale";
import type { Region } from "../types";

export interface UseRegionSelectOptions {
  /** Whether region selection is enabled. */
  enabled: boolean;
  /** X-axis scale for pixel-to-data conversion. */
  xScale: ScaleLinear<number, number>;
  /** Callback when a region is created. */
  onRegionSelect?: (region: Region) => void;
}

export interface UseRegionSelectReturn {
  /** Pending region being dragged (null when not dragging). */
  pendingRegion: Region | null;
  /** Mouse down handler — call on the interaction rect. */
  handleMouseDown: (event: React.MouseEvent<SVGRectElement>) => void;
  /** Mouse move handler — call on the interaction rect. */
  handleMouseMove: (event: React.MouseEvent<SVGRectElement>) => void;
  /** Mouse up handler — call on the interaction rect. */
  handleMouseUp: () => void;
}

export function useRegionSelect(
  options: UseRegionSelectOptions,
): UseRegionSelectReturn {
  const { enabled, xScale, onRegionSelect } = options;
  const [pendingRegion, setPendingRegion] = useState<Region | null>(null);
  const dragStartRef = useRef<number | null>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      if (!enabled || !event.shiftKey) return;
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const dataX = xScale.invert(px);
      dragStartRef.current = dataX;
      setPendingRegion({ xStart: dataX, xEnd: dataX });
    },
    [enabled, xScale],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      if (dragStartRef.current === null) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const dataX = xScale.invert(px);
      const start = dragStartRef.current;
      setPendingRegion({
        xStart: Math.min(start, dataX),
        xEnd: Math.max(start, dataX),
      });
    },
    [xScale],
  );

  const handleMouseUp = useCallback(() => {
    if (dragStartRef.current === null || !pendingRegion) return;
    const width = Math.abs(pendingRegion.xEnd - pendingRegion.xStart);
    if (width > 0) {
      onRegionSelect?.(pendingRegion);
    }
    dragStartRef.current = null;
    setPendingRegion(null);
  }, [pendingRegion, onRegionSelect]);

  return { pendingRegion, handleMouseDown, handleMouseMove, handleMouseUp };
}
