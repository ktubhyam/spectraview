import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardNavigation } from "../useKeyboardNavigation";

function makeKeyEvent(key: string): React.KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent;
}

describe("useKeyboardNavigation", () => {
  it("calls onZoomIn on '+' key", () => {
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onReset = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onZoomIn, onZoomOut, onReset }),
    );

    act(() => {
      result.current(makeKeyEvent("+"));
    });

    expect(onZoomIn).toHaveBeenCalledOnce();
    expect(onZoomOut).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });

  it("calls onZoomIn on '=' key (alternative)", () => {
    const onZoomIn = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onZoomIn, onZoomOut: vi.fn(), onReset: vi.fn() }),
    );

    act(() => {
      result.current(makeKeyEvent("="));
    });

    expect(onZoomIn).toHaveBeenCalledOnce();
  });

  it("calls onZoomOut on '-' key", () => {
    const onZoomOut = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onZoomIn: vi.fn(), onZoomOut, onReset: vi.fn() }),
    );

    act(() => {
      result.current(makeKeyEvent("-"));
    });

    expect(onZoomOut).toHaveBeenCalledOnce();
  });

  it("calls onReset on 'Escape' key", () => {
    const onReset = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onZoomIn: vi.fn(), onZoomOut: vi.fn(), onReset }),
    );

    act(() => {
      result.current(makeKeyEvent("Escape"));
    });

    expect(onReset).toHaveBeenCalledOnce();
  });

  it("does nothing when disabled", () => {
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onReset = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onZoomIn, onZoomOut, onReset, enabled: false }),
    );

    act(() => {
      result.current(makeKeyEvent("+"));
      result.current(makeKeyEvent("-"));
      result.current(makeKeyEvent("Escape"));
    });

    expect(onZoomIn).not.toHaveBeenCalled();
    expect(onZoomOut).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });

  it("prevents default on handled keys", () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onZoomIn: vi.fn(), onZoomOut: vi.fn(), onReset: vi.fn() }),
    );

    const event = makeKeyEvent("+");
    act(() => {
      result.current(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("ignores unhandled keys", () => {
    const onZoomIn = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onZoomIn, onZoomOut: vi.fn(), onReset: vi.fn() }),
    );

    const event = makeKeyEvent("a");
    act(() => {
      result.current(event);
    });

    expect(onZoomIn).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
