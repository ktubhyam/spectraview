import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { SpectraView } from "../SpectraView";
import {
  createTestSpectrum,
  createTestPeaks,
  createTestRegions,
} from "../../../test/helpers";

// Mock useZoomPan to avoid d3-zoom issues in jsdom
vi.mock("../../../hooks/useZoomPan", () => ({
  useZoomPan: () => ({
    zoomRef: { current: null },
    state: { transform: { k: 1, x: 0, y: 0 }, isZoomed: false },
    zoomedXScale: scaleLinear().domain([4000, 400]).range([0, 715]),
    zoomedYScale: scaleLinear().domain([0, 1]).range([330, 0]),
    resetZoom: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
  }),
}));

// Mock rendering utility used by SpectrumCanvas
vi.mock("../../../utils/rendering", () => ({
  drawAllSpectra: vi.fn(),
}));

describe("SpectraView", () => {
  it("renders empty state text when no spectra", () => {
    render(<SpectraView spectra={[]} />);

    expect(screen.getByText("No spectra loaded")).toBeInTheDocument();
  });

  it("renders canvas and SVG when spectra provided", () => {
    const { container } = render(
      <SpectraView spectra={[createTestSpectrum()]} />,
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("shows toolbar when showToolbar=true", () => {
    render(<SpectraView spectra={[createTestSpectrum()]} showToolbar={true} />);

    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset zoom" })).toBeInTheDocument();
  });

  it("hides toolbar when showToolbar=false", () => {
    render(<SpectraView spectra={[createTestSpectrum()]} showToolbar={false} />);

    expect(screen.queryByRole("button", { name: "Zoom in" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zoom out" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset zoom" })).not.toBeInTheDocument();
  });

  it("renders peak markers when peaks provided", () => {
    const peaks = createTestPeaks();
    const { container } = render(
      <SpectraView spectra={[createTestSpectrum()]} peaks={peaks} />,
    );

    const peakGroup = container.querySelector(".spectraview-peaks");
    expect(peakGroup).toBeTruthy();

    const polygons = peakGroup!.querySelectorAll("polygon");
    expect(polygons.length).toBeGreaterThan(0);
  });

  it("renders region highlights when regions provided", () => {
    const regions = createTestRegions();
    const { container } = render(
      <SpectraView spectra={[createTestSpectrum()]} regions={regions} />,
    );

    const regionGroup = container.querySelector(".spectraview-regions");
    expect(regionGroup).toBeTruthy();

    const rects = regionGroup!.querySelectorAll("rect");
    expect(rects.length).toBe(2);
  });

  it("applies className prop", () => {
    const { container } = render(
      <SpectraView spectra={[createTestSpectrum()]} className="my-custom-class" />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains("my-custom-class")).toBe(true);
  });

  it("applies dark theme", () => {
    const { container } = render(
      <SpectraView spectra={[createTestSpectrum()]} theme="dark" />,
    );

    const wrapper = container.firstChild as HTMLElement;
    // jsdom converts hex colors to rgb() format
    expect(wrapper.style.background).toBe("rgb(17, 24, 39)");
  });
});
