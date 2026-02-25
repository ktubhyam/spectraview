import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// Mock canvas 2D context globally (jsdom doesn't implement it)
const mockCanvasContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  setTransform: vi.fn(),
  get canvas() {
    return { width: 800, height: 400 };
  },
  strokeStyle: "",
  lineWidth: 1,
  globalAlpha: 1,
  lineJoin: "round" as CanvasLineJoin,
};

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCanvasContext);
HTMLCanvasElement.prototype.toBlob = vi.fn();

// Mock window.devicePixelRatio
Object.defineProperty(window, "devicePixelRatio", { value: 1, writable: true });
