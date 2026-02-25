/**
 * Hook for responsive sizing via ResizeObserver.
 *
 * Tracks the width (and optionally height) of a container element,
 * enabling the chart to auto-size to its parent.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface ResizeObserverSize {
  width: number;
  height: number;
}

export function useResizeObserver(): {
  ref: React.RefCallback<HTMLElement>;
  size: ResizeObserverSize | null;
} {
  const [size, setSize] = useState<ResizeObserverSize | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    elementRef.current = node;

    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });

    observer.observe(node);
    observerRef.current = observer;

    // Set initial size
    const { width, height } = node.getBoundingClientRect();
    setSize({ width: Math.round(width), height: Math.round(height) });
  }, []);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { ref, size };
}
