import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpectraView } from "../components/SpectraView/SpectraView";
import {
  createIRSpectrum,
  createSecondSpectrum,
  createThirdSpectrum,
  samplePeaks,
  sampleRegions,
  sampleAnnotations,
} from "./data";

const meta: Meta<typeof SpectraView> = {
  title: "Components/SpectraView",
  component: SpectraView,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    reverseX: { control: "boolean" },
    showGrid: { control: "boolean" },
    showCrosshair: { control: "boolean" },
    showToolbar: { control: "boolean" },
    showLegend: { control: "boolean" },
    displayMode: { control: "radio", options: ["overlay", "stacked"] },
    responsive: { control: "boolean" },
    enableDragDrop: { control: "boolean" },
    enableRegionSelect: { control: "boolean" },
    snapCrosshair: { control: "boolean" },
    width: { control: { type: "range", min: 400, max: 1200, step: 50 } },
    height: { control: { type: "range", min: 200, max: 800, step: 50 } },
  },
};

export default meta;
type Story = StoryObj<typeof SpectraView>;

export const DefaultIR: Story = {
  name: "Default IR Spectrum",
  args: {
    spectra: [createIRSpectrum()],
    width: 800,
    height: 400,
    reverseX: true,
  },
};

export const MultipleSpectra: Story = {
  name: "Multiple Spectra Overlay",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum()],
    width: 800,
    height: 400,
    reverseX: true,
  },
};

export const WithPeaks: Story = {
  name: "With Peak Markers",
  args: {
    spectra: [createIRSpectrum()],
    peaks: samplePeaks,
    width: 800,
    height: 400,
    reverseX: true,
  },
};

export const WithRegions: Story = {
  name: "With Region Highlights",
  args: {
    spectra: [createIRSpectrum()],
    regions: sampleRegions,
    width: 800,
    height: 400,
    reverseX: true,
  },
};

export const WithAnnotations: Story = {
  name: "With Text Annotations",
  args: {
    spectra: [createIRSpectrum()],
    annotations: sampleAnnotations,
    peaks: samplePeaks,
    width: 800,
    height: 400,
    reverseX: true,
  },
};

export const StackedMode: Story = {
  name: "Stacked Display Mode",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum(), createThirdSpectrum()],
    displayMode: "stacked",
    width: 800,
    height: 500,
    reverseX: true,
  },
};

export const DragAndDrop: Story = {
  name: "Drag-and-Drop Enabled",
  args: {
    spectra: [createIRSpectrum()],
    enableDragDrop: true,
    width: 800,
    height: 400,
    reverseX: true,
  },
};

export const RegionSelection: Story = {
  name: "Region Selection (Shift+Drag)",
  args: {
    spectra: [createIRSpectrum()],
    enableRegionSelect: true,
    regions: sampleRegions.slice(0, 1),
    width: 800,
    height: 400,
    reverseX: true,
  },
};

export const LineStyles: Story = {
  name: "Custom Line Styles",
  args: {
    spectra: [
      createIRSpectrum({ lineStyle: "solid", lineWidth: 2 }),
      createSecondSpectrum({ lineStyle: "dashed", lineWidth: 1.5 }),
      createThirdSpectrum({ lineStyle: "dotted", lineWidth: 1.5 }),
    ],
    width: 800,
    height: 400,
    reverseX: true,
  },
};

export const KitchenSink: Story = {
  name: "Kitchen Sink (All Features)",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum()],
    peaks: samplePeaks,
    regions: sampleRegions,
    annotations: sampleAnnotations,
    enableRegionSelect: true,
    snapCrosshair: true,
    width: 800,
    height: 400,
    reverseX: true,
  },
};

export const DarkTheme: Story = {
  name: "Dark Theme",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum()],
    peaks: samplePeaks,
    regions: sampleRegions,
    annotations: sampleAnnotations,
    width: 800,
    height: 400,
    reverseX: true,
    theme: "dark",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const DarkThemeStacked: Story = {
  name: "Dark Theme Stacked",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum(), createThirdSpectrum()],
    displayMode: "stacked",
    width: 800,
    height: 500,
    reverseX: true,
    theme: "dark",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const EmptyState: Story = {
  name: "Empty State",
  args: {
    spectra: [],
    width: 800,
    height: 400,
  },
};
