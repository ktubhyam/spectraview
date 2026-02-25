import type { Meta, StoryObj } from "@storybook/react-vite";
import { Minimap } from "../components/Minimap/Minimap";
import { createIRSpectrum, createSecondSpectrum } from "./data";

const meta: Meta<typeof Minimap> = {
  title: "Components/Minimap",
  component: Minimap,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Minimap>;

const spectra = [createIRSpectrum(), createSecondSpectrum()];

export const FullView: Story = {
  name: "Full View (Not Zoomed)",
  args: {
    spectra,
    xExtent: [400, 4000] as [number, number],
    yExtent: [0, 1] as [number, number],
    visibleXDomain: [400, 4000] as [number, number],
    width: 300,
    height: 60,
    isZoomed: false,
  },
};

export const Zoomed: Story = {
  name: "Zoomed In",
  args: {
    spectra,
    xExtent: [400, 4000] as [number, number],
    yExtent: [0, 1] as [number, number],
    visibleXDomain: [1500, 2500] as [number, number],
    width: 300,
    height: 60,
    isZoomed: true,
  },
};

export const DarkTheme: Story = {
  name: "Dark Theme",
  args: {
    spectra,
    xExtent: [400, 4000] as [number, number],
    yExtent: [0, 1] as [number, number],
    visibleXDomain: [1500, 2500] as [number, number],
    width: 300,
    height: 60,
    theme: "dark",
    isZoomed: true,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
