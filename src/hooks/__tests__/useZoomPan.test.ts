import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { useZoomPan } from "../useZoomPan";

/**
 * Build default options for useZoomPan using real d3 scaleLinear instances.
 *
 * Since jsdom has no real SVGRectElement, we cannot exercise d3-zoom's
 * DOM event handling. These tests focus on initial state, return shape,
 * and the enabled flag.
 */
function defaultOptions() {
  return {
    plotWidth: 600,
    plotHeight: 400,
    xScale: scaleLinear().domain([400, 4000]).range([0, 600]),
    yScale: scaleLinear().domain([0, 1]).range([400, 0]),
  };
}

describe("useZoomPan", () => {
  it("initializes with isZoomed false", () => {
    const { result } = renderHook(() => useZoomPan(defaultOptions()));

    expect(result.current.state.isZoomed).toBe(false);
  });

  it("initial zoomedXScale matches base xScale domain", () => {
    const opts = defaultOptions();
    const { result } = renderHook(() => useZoomPan(opts));

    const zoomedDomain = result.current.zoomedXScale.domain();
    const baseDomain = opts.xScale.domain();

    expect(zoomedDomain[0]).toBeCloseTo(baseDomain[0], 5);
    expect(zoomedDomain[1]).toBeCloseTo(baseDomain[1], 5);
  });

  it("initial zoomedYScale matches base yScale domain", () => {
    const opts = defaultOptions();
    const { result } = renderHook(() => useZoomPan(opts));

    const zoomedDomain = result.current.zoomedYScale.domain();
    const baseDomain = opts.yScale.domain();

    expect(zoomedDomain[0]).toBeCloseTo(baseDomain[0], 5);
    expect(zoomedDomain[1]).toBeCloseTo(baseDomain[1], 5);
  });

  it("provides resetZoom, zoomIn, zoomOut functions", () => {
    const { result } = renderHook(() => useZoomPan(defaultOptions()));

    expect(typeof result.current.resetZoom).toBe("function");
    expect(typeof result.current.zoomIn).toBe("function");
    expect(typeof result.current.zoomOut).toBe("function");
  });

  it("respects enabled=false", () => {
    const opts = { ...defaultOptions(), enabled: false };
    const { result } = renderHook(() => useZoomPan(opts));

    // Hook should still return a valid shape even when disabled
    expect(result.current.state.isZoomed).toBe(false);
    expect(result.current.zoomRef).toBeDefined();
    expect(typeof result.current.resetZoom).toBe("function");

    // zoomedXScale and zoomedYScale should still equal the base domains
    const zxDomain = result.current.zoomedXScale.domain();
    expect(zxDomain[0]).toBeCloseTo(400, 5);
    expect(zxDomain[1]).toBeCloseTo(4000, 5);

    const zyDomain = result.current.zoomedYScale.domain();
    expect(zyDomain[0]).toBeCloseTo(0, 5);
    expect(zyDomain[1]).toBeCloseTo(1, 5);
  });
});
