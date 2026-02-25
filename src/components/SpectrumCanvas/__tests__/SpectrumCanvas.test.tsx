import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { createRef } from "react";
import { scaleLinear } from "d3-scale";
import { SpectrumCanvas } from "../SpectrumCanvas";
import { createTestSpectrum } from "../../../test/helpers";

// Mock the rendering utility to avoid canvas drawing complexity
vi.mock("../../../utils/rendering", () => ({
  drawAllSpectra: vi.fn(),
}));

/** Helper to render SpectrumCanvas with defaults. */
function renderCanvas(overrides: Partial<Parameters<typeof SpectrumCanvas>[0]> = {}) {
  const defaultProps = {
    spectra: [createTestSpectrum()],
    xScale: scaleLinear().domain([400, 4000]).range([0, 715]),
    yScale: scaleLinear().domain([0, 1]).range([330, 0]),
    width: 715,
    height: 330,
    ...overrides,
  };

  return render(<SpectrumCanvas {...defaultProps} />);
}

describe("SpectrumCanvas", () => {
  it("renders a canvas element", () => {
    const { container } = renderCanvas();

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
  });

  it("calls getContext on mount", () => {
    renderCanvas();

    // getContext is mocked globally in setup.ts
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  });

  it("has correct style dimensions", () => {
    const { container } = renderCanvas({ width: 715, height: 330 });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.style.width).toBe("715px");
    expect(canvas.style.height).toBe("330px");
  });

  it("supports ref forwarding", () => {
    const canvasRef = createRef<HTMLCanvasElement>();

    render(
      <SpectrumCanvas
        ref={canvasRef}
        spectra={[createTestSpectrum()]}
        xScale={scaleLinear().domain([400, 4000]).range([0, 715])}
        yScale={scaleLinear().domain([0, 1]).range([330, 0])}
        width={715}
        height={330}
      />,
    );

    expect(canvasRef.current).toBeInstanceOf(HTMLCanvasElement);
  });

  it("has pointer-events: none", () => {
    const { container } = renderCanvas();

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.style.pointerEvents).toBe("none");
  });
});
