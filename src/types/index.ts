/**
 * Core type definitions for SpectraView.
 *
 * @module types
 */

/** Supported spectral technique types. */
export type SpectrumType =
  | "IR"
  | "Raman"
  | "NIR"
  | "UV-Vis"
  | "fluorescence"
  | "other";

/** Supported line styles for spectrum rendering. */
export type LineStyle = "solid" | "dashed" | "dotted" | "dash-dot";

/** A single spectrum dataset. */
export interface Spectrum {
  /** Unique identifier. */
  id: string;
  /** Display label. */
  label: string;
  /** X-axis values (wavenumbers, wavelengths, Raman shift, etc.). */
  x: Float64Array | number[];
  /** Y-axis values (absorbance, transmittance, intensity, etc.). */
  y: Float64Array | number[];
  /** X-axis unit (e.g., "cm⁻¹", "nm"). */
  xUnit?: string;
  /** Y-axis unit (e.g., "Absorbance", "Transmittance"). */
  yUnit?: string;
  /** Spectral technique type. */
  type?: SpectrumType;
  /** Rendering color (CSS color string). */
  color?: string;
  /** Line style for rendering. */
  lineStyle?: LineStyle;
  /** Line width in pixels. */
  lineWidth?: number;
  /** Whether this spectrum is visible. */
  visible?: boolean;
  /** Arbitrary metadata from file headers. */
  meta?: Record<string, string | number>;
}

/** A detected peak in a spectrum. */
export interface Peak {
  /** X-axis position. */
  x: number;
  /** Y-axis position. */
  y: number;
  /** Optional display label (e.g., wavenumber annotation). */
  label?: string;
  /** Associated spectrum ID. */
  spectrumId?: string;
}

/** A selected x-axis region. */
export interface Region {
  /** Start X value. */
  xStart: number;
  /** End X value. */
  xEnd: number;
  /** Optional display label. */
  label?: string;
  /** Optional fill color. */
  color?: string;
}

/** A text annotation placed on the chart. */
export interface Annotation {
  /** Unique identifier. */
  id: string;
  /** Data-space x position (anchor point). */
  x: number;
  /** Data-space y position (anchor point). */
  y: number;
  /** Annotation text. */
  text: string;
  /** Pixel offset from anchor point [dx, dy]. Defaults to [0, -20]. */
  offset?: [number, number];
  /** Font size in pixels. Defaults to 11. */
  fontSize?: number;
  /** Text color (CSS). Defaults to theme text color. */
  color?: string;
  /** Show anchor line from text to data point. Defaults to true. */
  showAnchorLine?: boolean;
}

/** Current zoom/pan view state. */
export interface ViewState {
  /** Visible x-axis domain [min, max]. */
  xDomain: [number, number];
  /** Visible y-axis domain [min, max]. */
  yDomain: [number, number];
}

/** Theme configuration. */
export type Theme = "light" | "dark";

/** Display mode for multiple spectra. */
export type DisplayMode = "overlay" | "stacked";

/** Legend position relative to the chart. */
export type LegendPosition = "top" | "bottom" | "left" | "right";

/** Margin configuration for the chart area. */
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Props for the main SpectraView component. */
export interface SpectraViewProps {
  /** Array of spectra to display. */
  spectra: Spectrum[];
  /** Width in pixels. */
  width?: number;
  /** Height in pixels. */
  height?: number;
  /** Reverse X axis (standard for IR wavenumber). */
  reverseX?: boolean;
  /** Show grid lines. */
  showGrid?: boolean;
  /** Show crosshair on hover. */
  showCrosshair?: boolean;
  /** Show toolbar controls. */
  showToolbar?: boolean;
  /** Peak markers to display. */
  peaks?: Peak[];
  /** Highlighted regions. */
  regions?: Region[];
  /** Text annotations to display on the chart. */
  annotations?: Annotation[];
  /** Snap crosshair to nearest spectrum data point. Defaults to true. */
  snapCrosshair?: boolean;
  /** X-axis label override. */
  xLabel?: string;
  /** Y-axis label override. */
  yLabel?: string;
  /** Display mode for multiple spectra. */
  displayMode?: DisplayMode;
  /** Chart margins. */
  margin?: Partial<Margin>;
  /** Theme. */
  theme?: Theme;
  /** Show legend (auto-shown when >1 spectrum). */
  showLegend?: boolean;
  /** Legend position. */
  legendPosition?: LegendPosition;
  /** Callback when a spectrum's visibility is toggled via legend. */
  onToggleVisibility?: (id: string) => void;
  /** Enable drag-and-drop file loading. */
  enableDragDrop?: boolean;
  /** Callback when files are dropped. */
  onFileDrop?: (files: File[]) => void;
  /** Enable interactive region selection (Shift+drag). */
  enableRegionSelect?: boolean;
  /** Callback when a region is created. */
  onRegionSelect?: (region: Region) => void;
  /** Responsive sizing (fills container width). */
  responsive?: boolean;
  /** Custom CSS class name. */
  className?: string;
  /** Ref to access the underlying Canvas element (for export). */
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  /** Callback when user clicks a peak marker. */
  onPeakClick?: (peak: Peak) => void;
  /** Callback when zoom/pan state changes. */
  onViewChange?: (view: ViewState) => void;
  /** Callback when crosshair position changes. */
  onCrosshairMove?: (x: number, y: number) => void;
}

/** Internal resolved configuration (defaults merged with user props). */
export interface ResolvedConfig {
  width: number;
  height: number;
  reverseX: boolean;
  showGrid: boolean;
  showCrosshair: boolean;
  showToolbar: boolean;
  showLegend: boolean;
  legendPosition: LegendPosition;
  displayMode: DisplayMode;
  margin: Margin;
  theme: Theme;
  responsive: boolean;
  enableDragDrop: boolean;
  enableRegionSelect: boolean;
}
