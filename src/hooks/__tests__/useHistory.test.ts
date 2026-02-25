import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHistory } from "../useHistory";

describe("useHistory", () => {
  it("initializes with initial state", () => {
    const { result } = renderHook(() =>
      useHistory({ initialState: "a" }),
    );
    expect(result.current.state).toBe("a");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("pushes new state", () => {
    const { result } = renderHook(() =>
      useHistory({ initialState: 0 }),
    );

    act(() => result.current.push(1));
    expect(result.current.state).toBe(1);
    expect(result.current.canUndo).toBe(true);
  });

  it("undoes to previous state", () => {
    const { result } = renderHook(() =>
      useHistory({ initialState: "a" }),
    );

    act(() => result.current.push("b"));
    act(() => result.current.push("c"));
    expect(result.current.state).toBe("c");

    act(() => result.current.undo());
    expect(result.current.state).toBe("b");

    act(() => result.current.undo());
    expect(result.current.state).toBe("a");
    expect(result.current.canUndo).toBe(false);
  });

  it("redoes after undo", () => {
    const { result } = renderHook(() =>
      useHistory({ initialState: 0 }),
    );

    act(() => result.current.push(1));
    act(() => result.current.push(2));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.redo());
    expect(result.current.state).toBe(2);
    expect(result.current.canRedo).toBe(false);
  });

  it("clears redo stack on new push", () => {
    const { result } = renderHook(() =>
      useHistory({ initialState: 0 }),
    );

    act(() => result.current.push(1));
    act(() => result.current.push(2));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.push(3));
    expect(result.current.canRedo).toBe(false);
    expect(result.current.state).toBe(3);
  });

  it("respects maxDepth", () => {
    const { result } = renderHook(() =>
      useHistory({ initialState: 0, maxDepth: 3 }),
    );

    act(() => result.current.push(1));
    act(() => result.current.push(2));
    act(() => result.current.push(3));
    act(() => result.current.push(4));
    // Max depth 3: oldest entry dropped
    expect(result.current.undoCount).toBe(3);
  });

  it("resets to initial state", () => {
    const { result } = renderHook(() =>
      useHistory({ initialState: "start" }),
    );

    act(() => result.current.push("a"));
    act(() => result.current.push("b"));

    act(() => result.current.reset());
    expect(result.current.state).toBe("start");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("returns false from undo/redo when empty", () => {
    const { result } = renderHook(() =>
      useHistory({ initialState: 0 }),
    );

    let undoResult: boolean;
    let redoResult: boolean;
    act(() => {
      undoResult = result.current.undo();
    });
    expect(undoResult!).toBe(false);

    act(() => {
      redoResult = result.current.redo();
    });
    expect(redoResult!).toBe(false);
  });

  it("tracks undo/redo counts", () => {
    const { result } = renderHook(() =>
      useHistory({ initialState: 0 }),
    );

    act(() => result.current.push(1));
    act(() => result.current.push(2));
    expect(result.current.undoCount).toBe(2);
    expect(result.current.redoCount).toBe(0);

    act(() => result.current.undo());
    expect(result.current.undoCount).toBe(1);
    expect(result.current.redoCount).toBe(1);
  });
});
