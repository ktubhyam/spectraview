/**
 * DropZone component for drag-and-drop file loading.
 *
 * Wraps children with drag event handling and shows a visual
 * overlay when files are dragged over.
 */

import { useCallback, useState, type ReactNode } from "react";
import type { Theme } from "../../types";

export interface DropZoneProps {
  /** Whether drag-drop is enabled. */
  enabled: boolean;
  /** Theme for styling the overlay. */
  theme: Theme;
  /** Width of the drop zone. */
  width: number;
  /** Height of the drop zone. */
  height: number;
  /** Callback when files are dropped. */
  onDrop?: (files: File[]) => void;
  /** Children to render inside the drop zone. */
  children: ReactNode;
}

export function DropZone({
  enabled,
  theme,
  width,
  height,
  onDrop,
  children,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCountRef = { current: 0 };

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.preventDefault();
      dragCountRef.current++;
      setIsDragging(true);
    },
    [enabled],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.preventDefault();
      dragCountRef.current--;
      if (dragCountRef.current <= 0) {
        dragCountRef.current = 0;
        setIsDragging(false);
      }
    },
    [enabled],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    [enabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;
      e.preventDefault();
      dragCountRef.current = 0;
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onDrop?.(files);
      }
    },
    [enabled, onDrop],
  );

  return (
    <div
      style={{ position: "relative", width, height }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      {isDragging && (
        <div
          data-testid="dropzone-overlay"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              theme === "dark"
                ? "rgba(30, 58, 138, 0.6)"
                : "rgba(59, 130, 246, 0.15)",
            border: `2px dashed ${theme === "dark" ? "#60a5fa" : "#3b82f6"}`,
            borderRadius: 4,
            zIndex: 100,
            pointerEvents: "none",
            fontSize: 14,
            fontFamily: "system-ui, sans-serif",
            color: theme === "dark" ? "#93c5fd" : "#1d4ed8",
            fontWeight: 500,
          }}
        >
          Drop spectrum files here
        </div>
      )}
    </div>
  );
}
