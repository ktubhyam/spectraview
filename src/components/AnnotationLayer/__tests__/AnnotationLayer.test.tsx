import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { scaleLinear } from "d3-scale";
import { AnnotationLayer } from "../AnnotationLayer";
import { LIGHT_THEME } from "../../../utils/colors";
import type { Annotation } from "../../../types";

const xScale = scaleLinear().domain([0, 100]).range([0, 500]);
const yScale = scaleLinear().domain([0, 100]).range([300, 0]);
const colors = LIGHT_THEME;

function renderAnnotations(annotations: Annotation[]) {
  return render(
    <svg>
      <AnnotationLayer
        annotations={annotations}
        xScale={xScale}
        yScale={yScale}
        colors={colors}
      />
    </svg>,
  );
}

describe("AnnotationLayer", () => {
  it("renders nothing for empty annotations", () => {
    const { container } = renderAnnotations([]);
    expect(container.querySelector(".spectraview-annotations")).toBeNull();
  });

  it("renders annotation text", () => {
    const annotations: Annotation[] = [
      { id: "a1", x: 50, y: 50, text: "C-H stretch" },
    ];
    const { container } = renderAnnotations(annotations);
    const texts = container.querySelectorAll("text");
    // Two text elements: background stroke + foreground
    expect(texts.length).toBe(2);
    expect(texts[1].textContent).toBe("C-H stretch");
  });

  it("renders anchor dot", () => {
    const annotations: Annotation[] = [
      { id: "a1", x: 50, y: 50, text: "Peak" },
    ];
    const { container } = renderAnnotations(annotations);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(1);
    expect(circles[0].getAttribute("cx")).toBe(String(xScale(50)));
    expect(circles[0].getAttribute("cy")).toBe(String(yScale(50)));
  });

  it("renders anchor line by default", () => {
    const annotations: Annotation[] = [
      { id: "a1", x: 50, y: 50, text: "Peak" },
    ];
    const { container } = renderAnnotations(annotations);
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBe(1);
  });

  it("hides anchor line when showAnchorLine is false", () => {
    const annotations: Annotation[] = [
      { id: "a1", x: 50, y: 50, text: "Peak", showAnchorLine: false },
    ];
    const { container } = renderAnnotations(annotations);
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBe(0);
  });

  it("renders multiple annotations", () => {
    const annotations: Annotation[] = [
      { id: "a1", x: 20, y: 40, text: "Peak A" },
      { id: "a2", x: 60, y: 80, text: "Peak B" },
      { id: "a3", x: 90, y: 10, text: "Peak C" },
    ];
    const { container } = renderAnnotations(annotations);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(3);
  });
});
