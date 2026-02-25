# SpectraView

Interactive React component for vibrational spectroscopy (IR, Raman, NIR).

[![npm version](https://img.shields.io/npm/v/spectraview)](https://www.npmjs.com/package/spectraview)
[![npm downloads](https://img.shields.io/npm/dm/spectraview)](https://www.npmjs.com/package/spectraview)
[![bundle size](https://img.shields.io/bundlephobia/minzip/spectraview)](https://bundlephobia.com/package/spectraview)
[![license](https://img.shields.io/npm/l/spectraview)](https://github.com/ktubhyam/spectraview/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/ktubhyam/spectraview/ci.yml)](https://github.com/ktubhyam/spectraview/actions)

## Features

- **High-performance rendering** — Canvas 2D for spectral data (10K+ points at 60fps), SVG for axes and annotations
- **Zoom and pan** — Mouse wheel zoom, click-drag pan, double-click reset
- **Reversed x-axis** — Standard IR wavenumber convention (high → low)
- **Peak detection** — Automatic peak picking with prominence filtering
- **Region selection** — Click-drag to highlight wavenumber regions
- **Multi-format loading** — JCAMP-DX, CSV/TSV, JSON
- **Multi-spectrum overlay** — Compare spectra with automatic color assignment
- **Crosshair** — Hover readout with coordinate display
- **Export** — PNG image, CSV data, JSON
- **Themes** — Light and dark mode
- **TypeScript** — Full type definitions included
- **Tiny bundle** — ~50-70KB min+gzip (no Plotly dependency)

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

```tsx
import { useSpectrumData, SpectraView } from "spectraview";

function App() {
  const { spectra, loadFile } = useSpectrumData();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <SpectraView spectra={spectra} reverseX showCrosshair />
    </div>
  );
}
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
| `peaks` | `Peak[]` | `[]` | Peak markers to display |
| `regions` | `Region[]` | `[]` | Highlighted regions |
| `xLabel` | `string` | auto | X-axis label |
| `yLabel` | `string` | auto | Y-axis label |
| `theme` | `"light" \| "dark"` | `"light"` | Color theme |
| `onPeakClick` | `(peak: Peak) => void` | — | Peak click callback |
| `onViewChange` | `(view: ViewState) => void` | — | Zoom/pan callback |
| `onCrosshairMove` | `(x, y) => void` | — | Crosshair move callback |

### Parsers

```ts
import { parseJcamp, parseCsv, parseJson } from "spectraview";

const spectra = await parseJcamp(jcampText);  // JCAMP-DX (.dx, .jdx)
const spectrum = parseCsv(csvText);            // CSV/TSV
const spectra = parseJson(jsonText);           // JSON
```

### Hooks

- **`useSpectrumData()`** — File loading and spectrum state management
- **`useZoomPan(options)`** — Zoom/pan behavior backed by d3-zoom
- **`usePeakPicking(spectra, options)`** — Automatic peak detection
- **`useExport()`** — PNG, CSV, JSON export functions

## Companion: SpectraKit (Python)

SpectraView pairs with [SpectraKit](https://github.com/ktubhyam/spectrakit), a Python library for spectral data processing:

- **SpectraKit** — Process spectra: baseline correction, normalization, despiking, similarity
- **SpectraView** — View spectra: interactive visualization in the browser

```
pip install spectrakit    # Process in Python
npm install spectraview   # View in the browser
```

## Browser Support

Chrome, Firefox, Safari, Edge (last 2 versions).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) — Tubhyam Karthikeyan
