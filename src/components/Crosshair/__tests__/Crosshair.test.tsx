import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Crosshair } from "../Crosshair";
import type { CrosshairPosition } from "../Crosshair";
import { LIGHT_THEME } from "../../../utils/colors";
import type { ThemeColors } from "../../../utils/colors";

/** Helper to render Crosshair wrapped in an SVG. */
function renderCrosshair(position: CrosshairPosition | null) {
  return render(
    <svg data-testid="svg-wrapper">
      <Crosshair
        position={position}
        width={715}
        height={330}
        colors={LIGHT_THEME as ThemeColors}
      />
    </svg>,
  );
}

describe("Crosshair", () => {
  it("returns null when position is null", () => {
    const { container } = renderCrosshair(null);

    // The <svg> wrapper should have no child <g> elements
    const svg = container.querySelector("svg");
    const crosshairGroup = svg!.querySelector(".spectraview-crosshair");
    expect(crosshairGroup).toBeNull();
  });

  it("renders crosshair lines when position provided", () => {
    const position: CrosshairPosition = { px: 200, py: 150, dataX: 2500, dataY: 0.6 };
    const { container } = renderCrosshair(position);

    const crosshairGroup = container.querySelector(".spectraview-crosshair");
    expect(crosshairGroup).toBeTruthy();

    const lines = crosshairGroup!.querySelectorAll("line");
    expect(lines.length).toBe(2);

    // Vertical line
    const vLine = lines[0];
    expect(vLine.getAttribute("x1")).toBe("200");
    expect(vLine.getAttribute("x2")).toBe("200");
    expect(vLine.getAttribute("y1")).toBe("0");
    expect(vLine.getAttribute("y2")).toBe("330");

    // Horizontal line
    const hLine = lines[1];
    expect(hLine.getAttribute("x1")).toBe("0");
    expect(hLine.getAttribute("x2")).toBe("715");
    expect(hLine.getAttribute("y1")).toBe("150");
    expect(hLine.getAttribute("y2")).toBe("150");
  });

  it("renders coordinate readout", () => {
    const position: CrosshairPosition = { px: 200, py: 150, dataX: 2500, dataY: 0.6 };
    const { container } = renderCrosshair(position);

    const crosshairGroup = container.querySelector(".spectraview-crosshair");
    const readoutText = crosshairGroup!.querySelector("text");
    expect(readoutText).toBeTruthy();

    // dataX=2500 formats via Math.round, dataY=0.6 formats via toFixed
    expect(readoutText!.textContent).toContain("2500");
  });

  it("uses pointer-events: none", () => {
    const position: CrosshairPosition = { px: 200, py: 150, dataX: 2500, dataY: 0.6 };
    const { container } = renderCrosshair(position);

    const crosshairGroup = container.querySelector(".spectraview-crosshair");
    expect(crosshairGroup).toBeTruthy();
    expect(crosshairGroup!.getAttribute("pointer-events")).toBe("none");
  });
});
