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
  /** Custom CSS class name. */
  className?: string;
  /** Callback when user selects a region via click-drag. */
  onRegionSelect?: (region: Region) => void;
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
  displayMode: DisplayMode;
  margin: Margin;
  theme: Theme;
}
