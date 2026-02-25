/**
 * Hook for zoom and pan behavior backed by d3-zoom.
 *
 * Provides smooth mouse wheel zoom, click-drag pan, and double-click
 * reset. Works with both the SVG overlay and Canvas data layers.
 */

import { useCallback, useEffect, useRef, useState } from "react";
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

  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);

  // Create rescaled axes from the current transform
  const zoomedXScale = transform.rescaleX(xScale.copy());
  const zoomedYScale = transform.rescaleY(yScale.copy());

  // Set up d3-zoom behavior
  useEffect(() => {
    if (!zoomRef.current || !enabled) return;

    const zoomBehavior = zoom<SVGRectElement, unknown>()
      .scaleExtent(scaleExtent)
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

        if (onViewChange) {
          const newXScale = newTransform.rescaleX(xScale.copy());
          const newYScale = newTransform.rescaleY(yScale.copy());
          onViewChange(
            newXScale.domain() as [number, number],
            newYScale.domain() as [number, number],
          );
        }
      });

    zoomBehaviorRef.current = zoomBehavior;

    select(zoomRef.current).call(zoomBehavior);

    // Double-click to reset
    select(zoomRef.current).on("dblclick.zoom", () => {
      select(zoomRef.current!).transition().duration(300).call(zoomBehavior.transform, zoomIdentity);
    });

    return () => {
      select(zoomRef.current!).on(".zoom", null);
    };
  }, [plotWidth, plotHeight, enabled, scaleExtent, xScale, yScale, onViewChange]);

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
