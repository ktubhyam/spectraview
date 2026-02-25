/**
 * Hook for keyboard navigation within the spectrum viewer.
 *
 * Handles arrow keys for panning, +/- for zoom, Escape for reset.
 */

import { useCallback } from "react";

export interface UseKeyboardNavigationOptions {
  /** Zoom in handler. */
  onZoomIn: () => void;
  /** Zoom out handler. */
  onZoomOut: () => void;
  /** Reset zoom handler. */
  onReset: () => void;
  /** Whether keyboard navigation is enabled. */
  enabled?: boolean;
}

export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions,
): (event: React.KeyboardEvent) => void {
  const { onZoomIn, onZoomOut, onReset, enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled) return;

      switch (event.key) {
        case "+":
        case "=":
          event.preventDefault();
          onZoomIn();
          break;
        case "-":
          event.preventDefault();
          onZoomOut();
          break;
        case "Escape":
          event.preventDefault();
          onReset();
          break;
      }
    },
    [enabled, onZoomIn, onZoomOut, onReset],
  );

  return handleKeyDown;
}
