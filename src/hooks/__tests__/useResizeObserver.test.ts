import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResizeObserver } from "../useResizeObserver";

// Store the callback so tests can trigger resize events
let resizeCallback: ResizeObserverCallback | null = null;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback;
  }
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
}

describe("useResizeObserver", () => {
  beforeEach(() => {
    resizeCallback = null;
    vi.clearAllMocks();
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null size initially before ref is attached", () => {
    const { result } = renderHook(() => useResizeObserver());
    expect(result.current.size).toBeNull();
    expect(typeof result.current.ref).toBe("function");
  });

  it("sets initial size from getBoundingClientRect when ref is attached", () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockElement = {
      getBoundingClientRect: () => ({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    act(() => {
      result.current.ref(mockElement);
    });

    expect(result.current.size).toEqual({ width: 800, height: 600 });
  });

  it("observes the element with ResizeObserver", () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockElement = {
      getBoundingClientRect: () => ({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        bottom: 300,
        right: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    act(() => {
      result.current.ref(mockElement);
    });

    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  it("updates size when ResizeObserver fires", () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockElement = {
      getBoundingClientRect: () => ({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        bottom: 300,
        right: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    act(() => {
      result.current.ref(mockElement);
    });

    expect(result.current.size).toEqual({ width: 400, height: 300 });

    // Simulate resize
    act(() => {
      resizeCallback!(
        [
          {
            contentRect: { width: 1024, height: 768 },
          } as ResizeObserverEntry,
        ],
        {} as ResizeObserver,
      );
    });

    expect(result.current.size).toEqual({ width: 1024, height: 768 });
  });

  it("rounds size values to integers", () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockElement = {
      getBoundingClientRect: () => ({
        width: 799.7,
        height: 599.3,
        top: 0,
        left: 0,
        bottom: 599.3,
        right: 799.7,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    act(() => {
      result.current.ref(mockElement);
    });

    expect(result.current.size).toEqual({ width: 800, height: 599 });
  });

  it("disconnects previous observer when ref changes", () => {
    const { result } = renderHook(() => useResizeObserver());

    const element1 = {
      getBoundingClientRect: () => ({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        bottom: 300,
        right: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    const element2 = {
      getBoundingClientRect: () => ({
        width: 600,
        height: 450,
        top: 0,
        left: 0,
        bottom: 450,
        right: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    act(() => {
      result.current.ref(element1);
    });

    act(() => {
      result.current.ref(element2);
    });

    // First observer should be disconnected
    expect(mockDisconnect).toHaveBeenCalled();
    expect(result.current.size).toEqual({ width: 600, height: 450 });
  });

  it("disconnects observer when ref is set to null", () => {
    const { result } = renderHook(() => useResizeObserver());

    const mockElement = {
      getBoundingClientRect: () => ({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        bottom: 300,
        right: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    act(() => {
      result.current.ref(mockElement);
    });

    act(() => {
      result.current.ref(null);
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("cleans up observer on unmount", () => {
    const { result, unmount } = renderHook(() => useResizeObserver());

    const mockElement = {
      getBoundingClientRect: () => ({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        bottom: 300,
        right: 400,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    act(() => {
      result.current.ref(mockElement);
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
