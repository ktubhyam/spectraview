import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Minimap } from "../Minimap";
import type { Spectrum } from "../../../types";

// Mock canvas context
const mockContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: "",
  lineWidth: 1,
  globalAlpha: 1,
};

vi.stubGlobal("HTMLCanvasElement", class {
  getContext() {
    return mockContext;
  }
});

const spectrum: Spectrum = {
  id: "s1",
  label: "Test",
  x: [100, 200, 300, 400, 500],
  y: [0.1, 0.5, 0.9, 0.3, 0.1],
};

describe("Minimap", () => {
  it("renders minimap container", () => {
    const { container } = render(
      <Minimap
        spectra={[spectrum]}
        xExtent={[100, 500]}
        yExtent={[0, 1]}
        visibleXDomain={[100, 500]}
        visibleYDomain={[0, 1]}
      />,
    );
    expect(container.querySelector(".spectraview-minimap")).not.toBeNull();
  });

  it("renders canvas element", () => {
    const { container } = render(
      <Minimap
        spectra={[spectrum]}
        xExtent={[100, 500]}
        yExtent={[0, 1]}
        visibleXDomain={[100, 500]}
        visibleYDomain={[0, 1]}
      />,
    );
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("shows viewport rect when zoomed", () => {
    const { container } = render(
      <Minimap
        spectra={[spectrum]}
        xExtent={[100, 500]}
        yExtent={[0, 1]}
        visibleXDomain={[200, 400]}
        visibleYDomain={[0, 1]}
        isZoomed={true}
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // Should have viewport rect + 2 dimming rects = 3 rects
    const rects = svg!.querySelectorAll("rect");
    expect(rects.length).toBe(3);
  });

  it("hides viewport rect when not zoomed", () => {
    const { container } = render(
      <Minimap
        spectra={[spectrum]}
        xExtent={[100, 500]}
        yExtent={[0, 1]}
        visibleXDomain={[100, 500]}
        visibleYDomain={[0, 1]}
        isZoomed={false}
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeNull();
  });

  it("uses custom dimensions", () => {
    const { container } = render(
      <Minimap
        spectra={[spectrum]}
        xExtent={[100, 500]}
        yExtent={[0, 1]}
        visibleXDomain={[100, 500]}
        visibleYDomain={[0, 1]}
        width={300}
        height={80}
      />,
    );
    const minimap = container.querySelector(".spectraview-minimap") as HTMLElement;
    expect(minimap.style.width).toBe("300px");
    expect(minimap.style.height).toBe("80px");
  });
});
