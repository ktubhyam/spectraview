# SpectraView

Interactive React component for vibrational spectroscopy (IR, Raman, NIR).

[![npm version](https://img.shields.io/npm/v/spectraview)](https://www.npmjs.com/package/spectraview)
[![npm downloads](https://img.shields.io/npm/dm/spectraview)](https://www.npmjs.com/package/spectraview)
[![bundle size](https://img.shields.io/bundlephobia/minzip/spectraview)](https://bundlephobia.com/package/spectraview)
[![license](https://img.shields.io/npm/l/spectraview)](https://github.com/ktubhyam/spectraview/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/ktubhyam/spectraview/ci.yml?branch=main)](https://github.com/ktubhyam/spectraview/actions)
[![coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ktubhyam/spectraview/coverage-badges/coverage.json)](https://github.com/ktubhyam/spectraview/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/storybook-deployed-ff4785)](https://ktubhyam.github.io/spectraview/)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.18802444.svg)](https://doi.org/10.5281/zenodo.18802444)

## Features

- **High-performance rendering** — Canvas 2D with LTTB downsampling (10K+ points at 60fps), SVG for axes and annotations
- **Zoom and pan** — Mouse wheel zoom, click-drag pan, double-click reset, keyboard shortcuts (+/−/Esc)
- **Reversed x-axis** — Standard IR wavenumber convention (high → low)
- **Peak detection** — Automatic peak picking with prominence filtering
- **Snap crosshair** — Hover readout that snaps to nearest data point with spectrum color indicator
- **Region selection** — Shift+drag to select wavenumber regions interactively
- **Annotations** — Positioned text labels with anchor lines on the chart
- **Multi-format parsing** — JCAMP-DX, CSV/TSV, JSON, and SPC (Thermo/Galactic binary)
- **Multi-spectrum overlay** — Compare spectra with automatic color assignment and legend
- **Stacked display** — View multiple spectra in vertically separated panels
- **Spectral processing** — Baseline correction (rubber-band), normalization (min-max, area, SNV), Savitzky-Golay smoothing, 1st/2nd derivatives
- **Spectrum comparison** — Difference, addition, scaling, Pearson correlation, residuals, grid interpolation
- **Export** — PNG, SVG, CSV, JSON with range filtering and precision control
- **Data table** — Sortable tabular view of spectrum values with region highlighting
- **Minimap** — Overview navigator showing viewport position within full spectrum
- **Tooltip** — Multi-spectrum hover tooltip with nearest peak indicator
- **Undo/redo** — Generic history hook for state management
- **Drag-and-drop** — Built-in drop zone for loading spectrum files
- **Responsive** — Optional auto-sizing to fill container width
- **Accessible** — ARIA labels, keyboard navigation, screen reader support
- **Themes** — Light and dark mode
- **TypeScript** — Full type definitions included
- **Tiny bundle** — ~48KB ESM / ~51KB CJS (no Plotly dependency)

## Installation

```bash
npm install spectraview
```

## Quick Start

```tsx
import { SpectraView } from "spectraview";

const spectrum = {
  id: "1",
  label: "Sample IR",
  x: new Float64Array([4000, 3500, 3000, 2500, 2000, 1500, 1000, 500]),
  y: new Float64Array([0.1, 0.3, 0.8, 0.2, 0.5, 0.9, 0.4, 0.1]),
  xUnit: "cm⁻¹",
  yUnit: "Absorbance",
};

function App() {
  return <SpectraView spectra={[spectrum]} reverseX />;
}
```

## Loading Files

SpectraView supports drag-and-drop file loading out of the box:

```tsx
import { SpectraView, useSpectrumData } from "spectraview";

function App() {
  const { spectra, loadFile } = useSpectrumData();

  return (
    <SpectraView
      spectra={spectra}
      reverseX
      enableDragDrop
      onFileDrop={(files) => files.forEach(loadFile)}
    />
  );
}
```

Or parse files manually:

```ts
import { parseJcamp, parseCsv, parseJson, parseSpc } from "spectraview";

const spectra = await parseJcamp(jcampText);   // JCAMP-DX (.dx, .jdx)
const spectrum = parseCsv(csvText);             // CSV/TSV
const spectra = parseJson(jsonText);            // JSON
const spectra = parseSpc(arrayBuffer);           // SPC binary (.spc)
```

## Peak Detection

```tsx
import { SpectraView, usePeakPicking } from "spectraview";

function App() {
  const spectra = [/* your spectra */];
  const peaks = usePeakPicking(spectra, {
    prominence: 0.05,
    minDistance: 10,
    maxPeaks: 20,
  });

  return (
    <SpectraView
      spectra={spectra}
      peaks={peaks}
      onPeakClick={(peak) => console.log("Clicked:", peak.x)}
      reverseX
    />
  );
}
```

## Spectral Processing

Apply common preprocessing transformations:

```ts
import {
  baselineRubberBand,
  normalizeMinMax,
  normalizeArea,
  normalizeSNV,
  smoothSavitzkyGolay,
  derivative1st,
  derivative2nd,
} from "spectraview";

const corrected = baselineRubberBand(spectrum.y);    // Rubber-band baseline correction
const normed = normalizeMinMax(spectrum.y);           // Scale to [0, 1]
const areaNormed = normalizeArea(spectrum.x, spectrum.y); // Unit area normalization
const snv = normalizeSNV(spectrum.y);                 // Standard Normal Variate
const smoothed = smoothSavitzkyGolay(spectrum.y, 7);  // SG smoothing (window=7)
const dy = derivative1st(spectrum.x, spectrum.y);     // 1st derivative
const d2y = derivative2nd(spectrum.x, spectrum.y);    // 2nd derivative
```

Or use the `useNormalization` hook for reactive transformations:

```tsx
import { useNormalization, SpectraView } from "spectraview";

function App() {
  const [mode, setMode] = useState("none");
  const { spectra: processed, modeLabel } = useNormalization({
    spectra: rawSpectra,
    mode, // "none" | "min-max" | "area" | "snv" | "baseline" | "smooth" | "derivative"
  });

  return <SpectraView spectra={processed} reverseX />;
}
```

## Spectrum Comparison

```ts
import {
  differenceSpectrum,
  addSpectra,
  scaleSpectrum,
  correlationCoefficient,
  residualSpectrum,
  interpolateToGrid,
} from "spectraview";

const diff = differenceSpectrum(spectrumA, spectrumB);  // A - B
const sum = addSpectra(spectrumA, spectrumB);            // A + B
const scaled = scaleSpectrum(spectrum, 2.5);             // Scale Y by factor
const r = correlationCoefficient(spectrumA, spectrumB);  // Pearson r ∈ [-1, 1]
const resid = residualSpectrum(spectrumA, spectrumB);    // |A - B|

// Align spectra to a common X grid before comparison
const aligned = interpolateToGrid(spectrumB, spectrumA.x);
```

## Data Export

```ts
import {
  spectrumToCsv,
  multiSpectraToCsv,
  spectrumToJson,
  downloadString,
  generateSvg,
  downloadSvg,
} from "spectraview";

// CSV export with options
const csv = spectrumToCsv(spectrum, {
  delimiter: ",",
  precision: 4,
  xRange: [1000, 2000],
  includeHeader: true,
});

// Multi-spectrum CSV (shared X column)
const multiCsv = multiSpectraToCsv([spectrumA, spectrumB]);

// JSON export
const json = spectrumToJson(spectrum, { xRange: [1000, 2000] });

// Trigger browser download
downloadString(csv, "spectrum.csv", "text/csv");
```

## API Reference

### `<SpectraView />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spectra` | `Spectrum[]` | required | Array of spectra to display |
| `width` | `number` | `800` | Width in pixels |
| `height` | `number` | `400` | Height in pixels |
| `reverseX` | `boolean` | `false` | Reverse x-axis (IR convention) |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showCrosshair` | `boolean` | `true` | Show hover crosshair |
| `showToolbar` | `boolean` | `true` | Show zoom controls |
| `showLegend` | `boolean` | `true` | Show spectrum legend |
| `legendPosition` | `"top" \| "bottom"` | `"bottom"` | Legend placement |
| `displayMode` | `"overlay" \| "stacked"` | `"overlay"` | Multi-spectrum display mode |
| `responsive` | `boolean` | `false` | Auto-size to container width |
| `theme` | `"light" \| "dark"` | `"light"` | Color theme |
| `peaks` | `Peak[]` | `[]` | Peak markers to display |
| `regions` | `Region[]` | `[]` | Highlighted regions |
| `annotations` | `Annotation[]` | `[]` | Text annotations on the chart |
| `snapCrosshair` | `boolean` | `true` | Snap crosshair to nearest data point |
| `xLabel` | `string` | auto | X-axis label override |
| `yLabel` | `string` | auto | Y-axis label override |
| `margin` | `Partial<Margin>` | — | Custom chart margins |
| `enableDragDrop` | `boolean` | `false` | Enable drag-and-drop file loading |
| `enableRegionSelect` | `boolean` | `false` | Enable Shift+drag region selection |
| `className` | `string` | — | Custom CSS class |
| `canvasRef` | `RefObject<HTMLCanvasElement>` | — | Ref to canvas element (for export) |
| `onPeakClick` | `(peak: Peak) => void` | — | Peak click callback |
| `onViewChange` | `(view: ViewState) => void` | — | Zoom/pan change callback |
| `onCrosshairMove` | `(x: number, y: number) => void` | — | Crosshair move callback |
| `onToggleVisibility` | `(id: string) => void` | — | Legend visibility toggle callback |
| `onFileDrop` | `(files: File[]) => void` | — | File drop callback |
| `onRegionSelect` | `(region: Region) => void` | — | Region selection callback |

### Sub-Components

For advanced composition, individual layers are exported:

```tsx
import {
  SpectrumCanvas,
  AxisLayer,
  PeakMarkers,
  RegionSelector,
  Crosshair,
  Toolbar,
  Legend,
  DropZone,
  AnnotationLayer,
  Minimap,
  Tooltip,
  DataTable,
  StackedView,
  ExportMenu,
} from "spectraview";
```

### Hooks

| Hook | Description |
|------|-------------|
| `useSpectrumData()` | File loading and spectrum state management |
| `useZoomPan(options)` | Zoom/pan behavior backed by d3-zoom |
| `usePeakPicking(spectra, options)` | Automatic peak detection |
| `useExport()` | PNG, CSV, JSON export functions |
| `useRegionSelect(options)` | Interactive Shift+drag region selection |
| `useResizeObserver()` | Container resize observation for responsive sizing |
| `useKeyboardNavigation(options)` | Keyboard shortcuts (+/−/Esc for zoom/reset) |
| `useNormalization(options)` | Reactive spectral normalization/processing |
| `useHistory(options)` | Generic undo/redo with configurable depth |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `+` or `=` | Zoom in |
| `-` | Zoom out |
| `Escape` | Reset zoom |

## Companion: SpectraKit (Python)

SpectraView pairs with [SpectraKit](https://github.com/ktubhyam/spectrakit), a Python library for spectral data processing:

- **SpectraKit** — Process spectra: baseline correction, normalization, despiking, similarity
- **SpectraView** — View spectra: interactive visualization in the browser

```
pip install pyspectrakit  # Process in Python
npm install spectraview   # View in the browser
```

## Browser Support

Chrome, Firefox, Safari, Edge (last 2 versions).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) — Tubhyam Karthikeyan
