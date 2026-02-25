import type { Meta, StoryObj } from "@storybook/react-vite";
import { scaleLinear } from "d3-scale";
import { SpectrumCanvas } from "../components/SpectrumCanvas/SpectrumCanvas";
import { createIRSpectrum, createSecondSpectrum } from "./data";

const meta: Meta<typeof SpectrumCanvas> = {
  title: "Components/SpectrumCanvas",
  component: SpectrumCanvas,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SpectrumCanvas>;

const xScale = scaleLinear().domain([4000, 400]).range([0, 715]);
const yScale = scaleLinear().domain([0, 1]).range([330, 0]);

export const SingleSpectrum: Story = {
  name: "Single Spectrum",
  args: {
    spectra: [createIRSpectrum()],
    xScale,
    yScale,
    width: 715,
    height: 330,
  },
};

export const MultiOverlay: Story = {
  name: "Multi-Spectrum Overlay",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum()],
    xScale,
    yScale,
    width: 715,
    height: 330,
  },
};
