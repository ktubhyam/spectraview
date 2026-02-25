/**
 * SVG export utility for generating publication-quality vector figures.
 *
 * Serializes a chart's SVG element to a standalone SVG string with
 * embedded spectral data paths.
 */

import type { ScaleLinear } from "d3-scale";
import type { Spectrum } from "../types";
import { getSpectrumColor } from "./colors";

/** Line dash patterns for different line styles. */
export const LINE_DASH_PATTERNS: Record<string, string> = {
  solid: "",
  dashed: "8 4",
  dotted: "2 2",
  "dash-dot": "8 4 2 4",
};

/** Supported line style values. */
export type LineStyle = "solid" | "dashed" | "dotted" | "dash-dot";

export interface SvgExportOptions {
  /** Width of the SVG. */
  width: number;
  /** Height of the SVG. */
  height: number;
  /** Background color. */
  background?: string;
  /** Title text for the SVG. */
  title?: string;
}

/**
 * Generate an SVG string for the given spectra.
 */
export function generateSvg(
  spectra: Spectrum[],
  xScale: ScaleLinear<number, number>,
  yScale: ScaleLinear<number, number>,
  options: SvgExportOptions,
): string {
  const { width, height, background = "#ffffff", title } = options;

  const paths = spectra
    .filter((s) => s.visible !== false)
    .map((s, i) => {
      const color = s.color ?? getSpectrumColor(i);
      const lineStyle = (s as SpectrumWithStyle).lineStyle ?? "solid";
      const lineWidth = (s as SpectrumWithStyle).lineWidth ?? 1.5;
      const dashArray = LINE_DASH_PATTERNS[lineStyle] ?? "";

      const n = Math.min(s.x.length, s.y.length);
      if (n < 2) return "";

      const points: string[] = [];
      for (let j = 0; j < n; j++) {
        const px = xScale(s.x[j] as number).toFixed(2);
        const py = yScale(s.y[j] as number).toFixed(2);
        points.push(`${j === 0 ? "M" : "L"}${px},${py}`);
      }

      return `<path d="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="${lineWidth}"${dashArray ? ` stroke-dasharray="${dashArray}"` : ""}/>\n    <!-- ${s.label} -->`;
    })
    .filter(Boolean)
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${background}"/>
  ${title ? `<text x="${width / 2}" y="20" text-anchor="middle" font-family="system-ui" font-size="14">${title}</text>` : ""}
  <g>
    ${paths}
  </g>
</svg>`;
}

/**
 * Download an SVG string as a file.
 */
export function downloadSvg(svg: string, filename = "spectrum.svg"): void {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Extended Spectrum with line style properties. */
interface SpectrumWithStyle extends Spectrum {
  lineStyle?: LineStyle;
  lineWidth?: number;
}
