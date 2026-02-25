/**
 * Generic undo/redo history hook using a command pattern.
 *
 * Stores snapshots of state in an undo/redo stack. Supports
 * arbitrary state types — works for zoom states, processing
 * configurations, or any serializable value.
 *
 * @module useHistory
 */

import { useCallback, useRef, useState } from "react";

export interface UseHistoryOptions<T> {
  /** Initial state. */
  initialState: T;
  /** Maximum history depth. Defaults to 50. */
  maxDepth?: number;
}

export interface UseHistoryReturn<T> {
  /** Current state. */
  state: T;
  /** Push a new state onto the history stack. */
  push: (state: T) => void;
  /** Undo to the previous state. Returns false if nothing to undo. */
  undo: () => boolean;
  /** Redo to the next state. Returns false if nothing to redo. */
  redo: () => boolean;
  /** Reset history to initial state. */
  reset: () => void;
  /** Whether undo is available. */
  canUndo: boolean;
  /** Whether redo is available. */
  canRedo: boolean;
  /** Number of states in the undo stack. */
  undoCount: number;
  /** Number of states in the redo stack. */
  redoCount: number;
}

export function useHistory<T>({
  initialState,
  maxDepth = 50,
}: UseHistoryOptions<T>): UseHistoryReturn<T> {
  const [state, setState] = useState<T>(initialState);
  const undoStack = useRef<T[]>([]);
  const redoStack = useRef<T[]>([]);
  // Track stack lengths for reactivity
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  const push = useCallback(
    (newState: T) => {
      setState((prev) => {
        undoStack.current.push(prev);
        if (undoStack.current.length > maxDepth) {
          undoStack.current.shift();
        }
        setUndoCount(undoStack.current.length);
        // Clear redo stack on new action
        redoStack.current = [];
        setRedoCount(0);
        return newState;
      });
    },
    [maxDepth],
  );

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (prev === undefined) return false;
    setState((current) => {
      redoStack.current.push(current);
      setRedoCount(redoStack.current.length);
      setUndoCount(undoStack.current.length);
      return prev;
    });
    return true;
  }, []);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (next === undefined) return false;
    setState((current) => {
      undoStack.current.push(current);
      setUndoCount(undoStack.current.length);
      setRedoCount(redoStack.current.length);
      return next;
    });
    return true;
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    undoStack.current = [];
    redoStack.current = [];
    setUndoCount(0);
    setRedoCount(0);
  }, [initialState]);

  return {
    state,
    push,
    undo,
    redo,
    reset,
    canUndo: undoCount > 0,
    canRedo: redoCount > 0,
    undoCount,
    redoCount,
  };
}
