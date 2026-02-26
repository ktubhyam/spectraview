# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.8.4] — 2026-02-26

### Fixed

- Sub-module barrel exports: added 4 missing components (AnnotationLayer, Minimap, Tooltip, DataTable), 3 hooks (useKeyboardNavigation, useNormalization, useHistory), 1 parser (parseSpc), 7 util modules
- CITATION.cff version updated to 1.8.2
- `.gitignore` expanded with `.claude/`, IDE dirs, `*.log`, OS files
- Removed stale `debug-storybook.log` and unused `vitest.shims.d.ts`
- Added `engines: { node: ">=18" }` to package.json

## [1.8.2] — 2026-02-26

### Added

- ESLint 9 flat config with TypeScript, React, and React Hooks rules
- Test coverage reporting in CI with PR comments and dynamic badge
- Tests for StackedView (8), useExport (9), useResizeObserver (8) — 25 new tests
- Coverage badge in README

### Fixed

- `Tooltip.tsx`: React rules-of-hooks violation (early return before useMemo)
- `spc.ts`: `let` → `const` for single-assignment variable
- README: `pip install spectrakit` → `pip install pyspectrakit`

## [1.8.1] — 2026-02-26

### Added

- 9 new Storybook stories: Legend, AnnotationLayer, DataTable, DropZone, ExportMenu, Minimap, Tooltip, StackedView, SpectrumCanvas (15 total, 100% component coverage)
- `.prettierrc` and `.editorconfig` for consistent formatting
- `SECURITY.md` with vulnerability reporting policy
- `.github/FUNDING.yml` for GitHub Sponsors
- GitHub issue templates (bug report, feature request)
- Pull request template with checklist

### Changed

- CHANGELOG.md now documents all versions 0.1.0 through 1.8.0
- CONTRIBUTING.md updated: pnpm → npm, added Storybook development section
- CITATION.cff version updated to 1.8.0 with new keywords
- Removed empty `demo/` and `paper/` directories

## [1.8.0] — 2026-02-26

### Changed

- Added npm keywords for better discoverability (SPC, canvas, d3, peak-detection, baseline-correction, savitzky-golay, normalization)
- Updated README with comprehensive API documentation covering all v1.x features

## [1.7.0] — 2026-02-26

### Added

- `DataTable` component — sortable tabular view of spectrum data with region highlighting
- `spectrumToCsv()` — single spectrum CSV export with range filtering, delimiter, and precision options
- `multiSpectraToCsv()` — multi-spectrum CSV with shared X column
- `spectrumToJson()` — JSON export with range filtering
- `downloadString()` — browser file download trigger utility

## [1.6.0] — 2026-02-26

### Added

- `useHistory` hook — generic undo/redo with configurable max depth
- Command pattern: `push()`, `undo()`, `redo()`, `reset()`, `canUndo`, `canRedo`

## [1.5.0] — 2026-02-26

### Added

- `useNormalization` hook — reactive spectral transformations for in-viewer processing
- Supports 7 modes: none, min-max, area, SNV, baseline, smooth, derivative
- Memoized transformation pipeline

## [1.4.0] — 2026-02-26

### Added

- `Tooltip` component — multi-spectrum hover tooltip with nearest peak indicator
- Binary search for O(log n) value lookup at cursor position
- Configurable number format (auto, fixed2, fixed4, scientific)
- Smart positioning to avoid clipping at plot edges

## [1.3.0] — 2026-02-26

### Added

- `differenceSpectrum()` — element-wise subtraction (A − B)
- `addSpectra()` — element-wise addition (A + B)
- `scaleSpectrum()` — scalar multiplication
- `correlationCoefficient()` — Pearson correlation coefficient
- `residualSpectrum()` — absolute difference |A − B|
- `interpolateToGrid()` — linear interpolation to align spectra on a common X grid

## [1.2.0] — 2026-02-26

### Added

- `Minimap` component — canvas-rendered overview navigator with SVG viewport overlay
- Dims areas outside the visible viewport when zoomed
- Decimated rendering for performance at any data size

## [1.1.0] — 2026-02-26

### Added

- `baselineRubberBand()` — rubber-band baseline correction via lower convex hull
- `normalizeMinMax()` — scale Y values to [0, 1]
- `normalizeArea()` — area normalization using trapezoidal integration
- `normalizeSNV()` — Standard Normal Variate normalization
- `smoothSavitzkyGolay()` — Savitzky-Golay smoothing with pre-computed coefficients (windows 5–11)
- `derivative1st()` — first derivative via central differences
- `derivative2nd()` — second derivative via central differences

## [1.0.0] — 2026-02-26

### Added

- `parseSpc()` — SPC binary format parser (Thermo/Galactic .spc files)
- Supports single and multi-spectrum SPC files
- Handles 16-bit integer and 32-bit float Y data
- Automatic X/Y unit label detection from SPC type codes

### Changed

- Stable public API — first major release

## [0.9.0] — 2026-02-26

### Added

- `lttbDownsample()` — Largest-Triangle-Three-Buckets downsampling algorithm

### Changed

- Replaced min-max decimation with LTTB in canvas rendering for better visual fidelity
- Wrapped `Toolbar` and `Legend` in `React.memo` for performance

### Removed

- `decimateMinMax()` internal function (replaced by LTTB)

## [0.8.0] — 2026-02-26

### Added

- `AnnotationLayer` component — text annotations with anchor dots and optional anchor lines
- `binarySearchClosest()` — O(log n) binary search for sorted arrays (ascending and descending)
- `snapToNearestSpectrum()` — finds nearest data point across all spectra in pixel space
- `snapCrosshair` prop on `<SpectraView />` — crosshair snaps to nearest data point (default: true)
- `annotations` prop on `<SpectraView />` — render text annotations on the chart
- `Annotation` type in core types

### Changed

- `Crosshair` component now renders a snap dot with spectrum color when snapped

## [0.7.0] — 2026-02-26

### Added

- `useKeyboardNavigation` hook — keyboard shortcuts: +/= zoom in, − zoom out, Esc reset
- `generateChartDescription()` — generates ARIA-friendly chart descriptions
- `prefersReducedMotion()` — detect reduced motion preference
- `KEYBOARD_SHORTCUTS` constant for discoverability
- ARIA attributes on `<SpectraView />`: `role="img"`, `aria-label`, `tabIndex`

## [0.6.0] — 2026-02-25

### Added

- `ExportMenu` component — dropdown menu with PNG, SVG, CSV, JSON export options
- `generateSvg()` — programmatic SVG export of chart
- `downloadSvg()` — trigger SVG file download
- `LINE_DASH_PATTERNS` — dash patterns for solid, dashed, dotted, dash-dot line styles
- `LineStyle` type and `lineStyle` / `lineWidth` properties on `Spectrum`

## [0.5.0] — 2026-02-25

### Added

- `StackedView` component — vertically separated panels for multi-spectrum display
- `displayMode` prop: `"overlay"` (default) or `"stacked"`
- `responsive` prop — auto-sizes component to fill container width
- `useResizeObserver` hook — container size observation

## [0.4.0] — 2026-02-25

### Added

- `DropZone` component — drag-and-drop file loading overlay
- `RegionSelector` component — interactive Shift+drag region selection
- `useRegionSelect` hook — handles region selection state and callbacks
- `enableDragDrop`, `onFileDrop`, `enableRegionSelect`, `onRegionSelect` props

## [0.3.0] — 2026-02-25

### Added

- `Legend` component — spectrum list with color swatches, visibility toggles, hover highlight
- `showLegend` and `legendPosition` props on `<SpectraView />`
- `onToggleVisibility` callback for spectrum hide/show
- Auto-shown when more than one spectrum is displayed

## [0.1.1] — 2026-02-25

### Fixed

- Counter-based clipPath IDs replaced with `useId()` to avoid collisions with multiple instances
- Canvas decimation for large datasets
- Export `ref` forwarding to internal canvas element
- CJS type resolution with split `.d.cts` declarations
- CI switched from pnpm to npm

## [0.1.0] — 2026-02-25

### Added

- Core `<SpectraView />` component with Canvas+SVG hybrid rendering
- Zoom/pan via d3-zoom (mouse wheel, drag, double-click reset)
- Reversed x-axis support (IR wavenumber convention)
- JCAMP-DX parser (built-in basic + optional jcampconverter)
- CSV/TSV parser with auto-delimiter detection
- JSON parser with flexible key names
- Peak detection with prominence filtering
- Peak marker annotations
- Region highlighting
- Crosshair with coordinate readout
- Toolbar with zoom controls
- Light and dark themes
- Multi-spectrum overlay rendering
- High-DPI Canvas rendering
- Export hooks (PNG, CSV, JSON)
- `useZoomPan` hook for zoom/pan state management
- `usePeakPicking` hook for automatic peak detection
- `useSpectrumData` hook for file loading and state management
- `useExport` hook for data and image export
- Full TypeScript type definitions
- 52 tests (parsers, utilities, scales, colors, peaks)
