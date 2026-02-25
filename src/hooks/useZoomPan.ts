/**
 * Hook for zoom and pan behavior backed by d3-zoom.
 *
 * Provides smooth mouse wheel zoom, click-drag pan, and double-click
 * reset. Works with both the SVG overlay and Canvas data layers.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zoom, type ZoomBehavior, zoomIdentity, type ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";
import "d3-transition";
import type { ScaleLinear } from "d3-scale";

export interface ZoomPanState {
  /** Current d3 zoom transform. */
  transform: ZoomTransform;
  /** Whether the view is currently zoomed (not at identity). */
  isZoomed: boolean;
}

export interface UseZoomPanOptions {
  /** Width of the plot area (excluding margins). */
  plotWidth: number;
  /** Height of the plot area (excluding margins). */
  plotHeight: number;
  /** Base x-scale (unzoomed). */
  xScale: ScaleLinear<number, number>;
  /** Base y-scale (unzoomed). */
  yScale: ScaleLinear<number, number>;
  /** Maximum zoom factor. */
  scaleExtent?: [number, number];
  /** Whether zoom/pan is enabled. */
  enabled?: boolean;
  /** Callback when the view changes. */
  onViewChange?: (xDomain: [number, number], yDomain: [number, number]) => void;
}

export interface UseZoomPanReturn {
  /** Ref to attach to the interaction overlay element. */
  zoomRef: React.RefObject<SVGRectElement | null>;
  /** Current zoom/pan state. */
  state: ZoomPanState;
  /** Zoomed (rescaled) x-scale. */
  zoomedXScale: ScaleLinear<number, number>;
  /** Zoomed (rescaled) y-scale. */
  zoomedYScale: ScaleLinear<number, number>;
  /** Reset zoom to initial view. */
  resetZoom: () => void;
  /** Zoom in by a fixed step. */
  zoomIn: () => void;
  /** Zoom out by a fixed step. */
  zoomOut: () => void;
}

/** Zoom step multiplier for zoomIn/zoomOut. */
const ZOOM_STEP = 1.5;

export function useZoomPan(options: UseZoomPanOptions): UseZoomPanReturn {
  const {
    plotWidth,
    plotHeight,
    xScale,
    yScale,
    scaleExtent = [1, 50],
    enabled = true,
    onViewChange,
  } = options;

  const zoomRef = useRef<SVGRectElement | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGRectElement, unknown> | null>(null);

  // Store callbacks and config in refs to avoid effect re-runs (REACT-2 fix)
  const onViewChangeRef = useRef(onViewChange);
  onViewChangeRef.current = onViewChange;
  const scaleExtentRef = useRef(scaleExtent);
  scaleExtentRef.current = scaleExtent;

  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);

  // Memoize rescaled axes from the current transform (BUG-4 fix)
  const zoomedXScale = useMemo(
    () => transform.rescaleX(xScale.copy()),
    [transform, xScale],
  );
  const zoomedYScale = useMemo(
    () => transform.rescaleY(yScale.copy()),
    [transform, yScale],
  );

  // Set up d3-zoom behavior
  useEffect(() => {
    const element = zoomRef.current;
    if (!element || !enabled) return;

    const zoomBehavior = zoom<SVGRectElement, unknown>()
      .scaleExtent(scaleExtentRef.current)
      .extent([
        [0, 0],
        [plotWidth, plotHeight],
      ])
      .translateExtent([
        [-Infinity, -Infinity],
        [Infinity, Infinity],
      ])
      .on("zoom", (event) => {
        const newTransform = event.transform as ZoomTransform;
        setTransform(newTransform);

        if (onViewChangeRef.current) {
          const newXScale = newTransform.rescaleX(xScale.copy());
          const newYScale = newTransform.rescaleY(yScale.copy());
          onViewChangeRef.current(
            newXScale.domain() as [number, number],
            newYScale.domain() as [number, number],
          );
        }
      });

    zoomBehaviorRef.current = zoomBehavior;

    select(element).call(zoomBehavior);

    // Double-click to reset
    select(element).on("dblclick.zoom", () => {
      select(element).transition().duration(300).call(zoomBehavior.transform, zoomIdentity);
    });

    // Stale ref fix: use captured `element` instead of zoomRef.current
    return () => {
      select(element).on(".zoom", null);
    };
  }, [plotWidth, plotHeight, enabled, xScale, yScale]);

  const resetZoom = useCallback(() => {
    if (!zoomRef.current || !zoomBehaviorRef.current) return;
    select(zoomRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.transform, zoomIdentity);
  }, []);

  const zoomIn = useCallback(() => {
    if (!zoomRef.current || !zoomBehaviorRef.current) return;
    select(zoomRef.current)
      .transition()
      .duration(200)
      .call(zoomBehaviorRef.current.scaleBy, ZOOM_STEP);
  }, []);

  const zoomOut = useCallback(() => {
    if (!zoomRef.current || !zoomBehaviorRef.current) return;
    select(zoomRef.current)
      .transition()
      .duration(200)
      .call(zoomBehaviorRef.current.scaleBy, 1 / ZOOM_STEP);
  }, []);

  return {
    zoomRef,
    state: {
      transform,
      isZoomed: transform.k !== 1 || transform.x !== 0 || transform.y !== 0,
    },
    zoomedXScale,
    zoomedYScale,
    resetZoom,
    zoomIn,
    zoomOut,
  };
}
