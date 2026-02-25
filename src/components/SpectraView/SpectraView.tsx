/**
 * SpectraView — Main interactive spectrum viewer component.
 *
 * Composes the Canvas data layer, SVG axis/annotation layer,
 * crosshair, peak markers, region selection, toolbar, and zoom/pan
 * into a single embeddable React component.
 *
 * Architecture:
 *   - Canvas layer: high-performance spectral line rendering (10K+ points)
 *   - SVG layer: axes, grid, annotations, crosshair (lightweight interactive elements)
 *   - d3-zoom: zoom/pan math via useZoomPan hook
 */

import { useCallback, useId, useMemo, useRef, useState } from "react";
import type {
  SpectraViewProps,
  ResolvedConfig,
  Margin,
  Spectrum,
} from "../../types";
import { computeXExtent, computeYExtent, createXScale, createYScale } from "../../utils/scales";
import { getThemeColors } from "../../utils/colors";
import { useZoomPan } from "../../hooks/useZoomPan";
import { SpectrumCanvas } from "../SpectrumCanvas/SpectrumCanvas";
import { AxisLayer } from "../AxisLayer/AxisLayer";
import { PeakMarkers } from "../PeakMarkers/PeakMarkers";
import { RegionSelector } from "../RegionSelector/RegionSelector";
import { Crosshair } from "../Crosshair/Crosshair";
import type { CrosshairPosition } from "../Crosshair/Crosshair";
import { Toolbar } from "../Toolbar/Toolbar";
import { Legend } from "../Legend/Legend";
import { DropZone } from "../DropZone/DropZone";
import { StackedView } from "../StackedView/StackedView";
import { useRegionSelect } from "../../hooks/useRegionSelect";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { generateChartDescription } from "../../utils/a11y";

/** Default chart margins. */
const DEFAULT_MARGIN: Margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 65,
};

/** Default component width. */
const DEFAULT_WIDTH = 800;

/** Default component height. */
const DEFAULT_HEIGHT = 400;

/**
 * Resolve user props into a complete configuration with defaults.
 */
function resolveConfig(props: SpectraViewProps): ResolvedConfig {
  return {
    width: props.width ?? DEFAULT_WIDTH,
    height: props.height ?? DEFAULT_HEIGHT,
    reverseX: props.reverseX ?? false,
    showGrid: props.showGrid ?? true,
    showCrosshair: props.showCrosshair ?? true,
    showToolbar: props.showToolbar ?? true,
    showLegend: props.showLegend ?? true,
    legendPosition: props.legendPosition ?? "bottom",
    displayMode: props.displayMode ?? "overlay",
    margin: { ...DEFAULT_MARGIN, ...props.margin },
    theme: props.theme ?? "light",
    responsive: props.responsive ?? false,
    enableDragDrop: props.enableDragDrop ?? false,
    enableRegionSelect: props.enableRegionSelect ?? false,
  };
}

/**
 * Infer axis labels from spectrum metadata if not provided.
 */
function inferLabels(
  spectra: Spectrum[],
  xLabel?: string,
  yLabel?: string,
): { xLabel: string; yLabel: string } {
  const first = spectra[0];
  return {
    xLabel: xLabel ?? first?.xUnit ?? "x",
    yLabel: yLabel ?? first?.yUnit ?? "y",
  };
}

export function SpectraView(props: SpectraViewProps) {
  const {
    spectra,
    peaks = [],
    regions = [],
    onPeakClick,
    onViewChange,
    onCrosshairMove,
    onToggleVisibility,
    onFileDrop,
    onRegionSelect,
    canvasRef,
  } = props;

  // Responsive sizing
  const { ref: resizeRef, size: measuredSize } = useResizeObserver();

  // Unique ID for this instance to avoid clipPath collisions (BUG-1 fix)
  const instanceId = useId();
  const clipId = `spectraview-clip-${instanceId.replace(/:/g, "")}`;

  const config = useMemo(() => resolveConfig(props), [
    props.width,
    props.height,
    props.reverseX,
    props.showGrid,
    props.showCrosshair,
    props.showToolbar,
    props.showLegend,
    props.legendPosition,
    props.displayMode,
    props.margin,
    props.theme,
    props.responsive,
    props.enableDragDrop,
    props.enableRegionSelect,
  ]);

  // Use measured width when responsive, fall back to configured width
  const width =
    config.responsive && measuredSize ? measuredSize.width : config.width;
  const { height, margin, reverseX, theme } = config;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const colors = useMemo(() => getThemeColors(theme), [theme]);
  const labels = useMemo(
    () => inferLabels(spectra, props.xLabel, props.yLabel),
    [spectra, props.xLabel, props.yLabel],
  );

  // Compute data extents
  const xExtent = useMemo(() => computeXExtent(spectra), [spectra]);
  const yExtent = useMemo(() => computeYExtent(spectra), [spectra]);

  // Create base (unzoomed) scales
  const baseXScale = useMemo(
    () => createXScale(xExtent, width, margin, reverseX),
    [xExtent, width, margin, reverseX],
  );
  const baseYScale = useMemo(
    () => createYScale(yExtent, height, margin),
    [yExtent, height, margin],
  );

  // Stable onViewChange wrapper via ref to avoid re-attaching zoom
  const onViewChangeRef = useRef(onViewChange);
  onViewChangeRef.current = onViewChange;
  const stableOnViewChange = useMemo(
    () =>
      (xDomain: [number, number], yDomain: [number, number]) => {
        onViewChangeRef.current?.({ xDomain, yDomain });
      },
    [],
  );

  // Zoom/pan behavior
  const {
    zoomRef,
    state: zoomState,
    zoomedXScale,
    zoomedYScale,
    resetZoom,
    zoomIn,
    zoomOut,
  } = useZoomPan({
    plotWidth,
    plotHeight,
    xScale: baseXScale,
    yScale: baseYScale,
    onViewChange: onViewChange ? stableOnViewChange : undefined,
  });

  // Region selection (Shift+drag)
  const {
    pendingRegion,
    handleMouseDown: regionMouseDown,
    handleMouseMove: regionMouseMove,
    handleMouseUp: regionMouseUp,
  } = useRegionSelect({
    enabled: config.enableRegionSelect,
    xScale: zoomedXScale,
    onRegionSelect,
  });

  // Highlighted spectrum for legend hover
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Crosshair state — managed here so the zoom rect handles all mouse events (BUG-2 fix)
  const [crosshairPos, setCrosshairPos] = useState<CrosshairPosition | null>(null);
  const onCrosshairMoveRef = useRef(onCrosshairMove);
  onCrosshairMoveRef.current = onCrosshairMove;

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      if (!config.showCrosshair) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const dataX = zoomedXScale.invert(px);
      const dataY = zoomedYScale.invert(py);
      setCrosshairPos({ px, py, dataX, dataY });
      onCrosshairMoveRef.current?.(dataX, dataY);
    },
    [zoomedXScale, zoomedYScale, config.showCrosshair],
  );

  const handleMouseLeave = useCallback(() => {
    setCrosshairPos(null);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useKeyboardNavigation({
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onReset: resetZoom,
  });

  // ARIA description
  const chartDescription = useMemo(
    () => generateChartDescription(spectra.length, labels.xLabel, labels.yLabel),
    [spectra.length, labels.xLabel, labels.yLabel],
  );

  const isStacked = config.displayMode === "stacked";

  // Empty state
  if (spectra.length === 0) {
    return (
      <div
        ref={config.responsive ? resizeRef : undefined}
        style={{
          width: config.responsive ? "100%" : width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px dashed ${colors.gridColor}`,
          borderRadius: 8,
          color: colors.tickColor,
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
        }}
        className={props.className}
      >
        No spectra loaded
      </div>
    );
  }

  const toolbarHeight = config.showToolbar ? 37 : 0;

  return (
    <div
      ref={config.responsive ? resizeRef : undefined}
      style={{
        width: config.responsive ? "100%" : width,
        background: colors.background,
        borderRadius: 4,
        overflow: "hidden",
      }}
      className={props.className}
      role="img"
      aria-label={chartDescription}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Toolbar */}
      {config.showToolbar && (
        <Toolbar
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetZoom}
          isZoomed={zoomState.isZoomed}
          theme={theme}
        />
      )}

      {/* Legend (top position) */}
      {config.showLegend && config.legendPosition === "top" && (
        <Legend
          spectra={spectra}
          theme={theme}
          position="top"
          onToggleVisibility={onToggleVisibility}
          onHighlight={setHighlightedId}
          highlightedId={highlightedId}
        />
      )}

      {/* Chart area wrapped in DropZone */}
      <DropZone
        enabled={config.enableDragDrop}
        theme={theme}
        width={width}
        height={height - toolbarHeight}
        onDrop={onFileDrop}
      >
        {isStacked ? (
          /* Stacked mode: each spectrum in its own panel */
          <svg
            width={width}
            height={height - toolbarHeight}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <StackedView
                spectra={spectra}
                xScale={zoomedXScale}
                plotWidth={plotWidth}
                plotHeight={plotHeight}
                margin={margin}
                theme={theme}
                showGrid={config.showGrid}
                xLabel={labels.xLabel}
                yLabel={labels.yLabel}
              />

              {/* Zoom/pan interaction rect */}
              <rect
                ref={zoomRef}
                x={0}
                y={0}
                width={plotWidth}
                height={plotHeight}
                fill="transparent"
                style={{ cursor: "grab" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            </g>
          </svg>
        ) : (
          /* Overlay mode: all spectra on single canvas */
          <>
            {/* Canvas layer for spectral data (behind SVG) */}
            <div
              style={{
                position: "absolute",
                top: margin.top,
                left: margin.left,
                width: plotWidth,
                height: plotHeight,
                overflow: "hidden",
              }}
            >
              <SpectrumCanvas
                ref={canvasRef}
                spectra={spectra}
                xScale={zoomedXScale}
                yScale={zoomedYScale}
                width={plotWidth}
                height={plotHeight}
                highlightedId={highlightedId ?? undefined}
              />
            </div>

            {/* SVG overlay for axes, annotations, crosshair */}
            <svg
              width={width}
              height={height - toolbarHeight}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Axes and grid */}
                <AxisLayer
                  xScale={zoomedXScale}
                  yScale={zoomedYScale}
                  width={plotWidth}
                  height={plotHeight}
                  xLabel={labels.xLabel}
                  yLabel={labels.yLabel}
                  showGrid={config.showGrid}
                  colors={colors}
                />

                {/* Clip path for plot area content */}
                <defs>
                  <clipPath id={clipId}>
                    <rect x={0} y={0} width={plotWidth} height={plotHeight} />
                  </clipPath>
                </defs>

                <g clipPath={`url(#${clipId})`}>
                  {/* Region highlights */}
                  {regions.length > 0 && (
                    <RegionSelector
                      regions={regions}
                      xScale={zoomedXScale}
                      height={plotHeight}
                      colors={colors}
                    />
                  )}

                  {/* Peak markers */}
                  {peaks.length > 0 && (
                    <PeakMarkers
                      peaks={peaks}
                      xScale={zoomedXScale}
                      yScale={zoomedYScale}
                      colors={colors}
                      onPeakClick={onPeakClick}
                    />
                  )}
                </g>

                {/* Crosshair (rendered above data, pointer-events: none) */}
                {config.showCrosshair && (
                  <Crosshair
                    position={crosshairPos}
                    width={plotWidth}
                    height={plotHeight}
                    colors={colors}
                  />
                )}

                {/* Pending region highlight */}
                {pendingRegion && (
                  <rect
                    x={zoomedXScale(pendingRegion.xStart)}
                    y={0}
                    width={Math.abs(
                      zoomedXScale(pendingRegion.xEnd) -
                        zoomedXScale(pendingRegion.xStart),
                    )}
                    height={plotHeight}
                    fill={colors.regionFill}
                    stroke={colors.regionStroke}
                    strokeWidth={1}
                    pointerEvents="none"
                  />
                )}

                {/* Zoom/pan + crosshair interaction rect */}
                <rect
                  ref={zoomRef}
                  x={0}
                  y={0}
                  width={plotWidth}
                  height={plotHeight}
                  fill="transparent"
                  style={{ cursor: config.showCrosshair ? "crosshair" : "grab" }}
                  onMouseDown={regionMouseDown}
                  onMouseMove={(e) => {
                    handleMouseMove(e);
                    regionMouseMove(e);
                  }}
                  onMouseUp={regionMouseUp}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            </svg>
          </>
        )}
      </DropZone>

      {/* Legend (bottom position) */}
      {config.showLegend && config.legendPosition === "bottom" && (
        <Legend
          spectra={spectra}
          theme={theme}
          position="bottom"
          onToggleVisibility={onToggleVisibility}
          onHighlight={setHighlightedId}
          highlightedId={highlightedId}
        />
      )}
    </div>
  );
}
