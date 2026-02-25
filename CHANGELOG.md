# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Core `<SpectraView />` component with Canvas+SVG hybrid rendering
- Zoom/pan via d3-zoom (mouse wheel, drag, double-click reset)
- Reversed x-axis support (IR wavenumber convention)
- JCAMP-DX parser (built-in basic + optional jcampconverter)
- CSV/TSV parser with auto-delimiter detection
- JSON parser with flexible key names
- Peak detection with prominence filtering
- Peak marker annotations
- Region selection and highlighting
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
