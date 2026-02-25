import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpectraView } from "../components/SpectraView/SpectraView";
import {
  createIRSpectrum,
  createSecondSpectrum,
  samplePeaks,
  sampleRegions,
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

export const FullAnnotations: Story = {
  name: "Peaks + Regions",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum()],
    peaks: samplePeaks,
    regions: sampleRegions,
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
    width: 800,
    height: 400,
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
