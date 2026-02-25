import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRegionSelect } from "../useRegionSelect";
import { scaleLinear } from "d3-scale";

function makeXScale() {
  return scaleLinear().domain([0, 100]).range([0, 800]);
}

function makeSvgEvent(px: number, shiftKey = false) {
  return {
    preventDefault: vi.fn(),
    shiftKey,
    clientX: px,
    clientY: 50,
    currentTarget: {
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
    },
  } as unknown as React.MouseEvent<SVGRectElement>;
}

describe("useRegionSelect", () => {
  it("returns null pendingRegion initially", () => {
    const { result } = renderHook(() =>
      useRegionSelect({ enabled: true, xScale: makeXScale() }),
    );
    expect(result.current.pendingRegion).toBeNull();
  });

  it("creates pending region on Shift+mousedown", () => {
    const { result } = renderHook(() =>
      useRegionSelect({ enabled: true, xScale: makeXScale() }),
    );
    act(() => {
      result.current.handleMouseDown(makeSvgEvent(100, true));
    });
    expect(result.current.pendingRegion).not.toBeNull();
  });

  it("does not create region without Shift", () => {
    const { result } = renderHook(() =>
      useRegionSelect({ enabled: true, xScale: makeXScale() }),
    );
    act(() => {
      result.current.handleMouseDown(makeSvgEvent(100, false));
    });
    expect(result.current.pendingRegion).toBeNull();
  });

  it("does not create region when disabled", () => {
    const { result } = renderHook(() =>
      useRegionSelect({ enabled: false, xScale: makeXScale() }),
    );
    act(() => {
      result.current.handleMouseDown(makeSvgEvent(100, true));
    });
    expect(result.current.pendingRegion).toBeNull();
  });

  it("calls onRegionSelect on mouseup", () => {
    const onRegionSelect = vi.fn();
    const { result } = renderHook(() =>
      useRegionSelect({
        enabled: true,
        xScale: makeXScale(),
        onRegionSelect,
      }),
    );
    act(() => {
      result.current.handleMouseDown(makeSvgEvent(100, true));
    });
    act(() => {
      result.current.handleMouseMove(makeSvgEvent(300, true));
    });
    act(() => {
      result.current.handleMouseUp();
    });
    expect(onRegionSelect).toHaveBeenCalledTimes(1);
    const region = onRegionSelect.mock.calls[0][0];
    expect(region.xStart).toBeLessThan(region.xEnd);
  });
});
