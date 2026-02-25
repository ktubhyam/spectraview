import type { Meta, StoryObj } from "@storybook/react-vite";
import { scaleLinear } from "d3-scale";
import { StackedView } from "../components/StackedView/StackedView";
import { createIRSpectrum, createSecondSpectrum, createThirdSpectrum } from "./data";

function SvgDecorator(Story: React.ComponentType) {
  return (
    <svg width={800} height={500}>
      <g transform="translate(65, 20)">
        <Story />
      </g>
    </svg>
  );
}

const meta: Meta<typeof StackedView> = {
  title: "Components/StackedView",
  component: StackedView,
  decorators: [SvgDecorator],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof StackedView>;

const xScale = scaleLinear().domain([4000, 400]).range([0, 715]);
const margin = { top: 20, right: 20, bottom: 50, left: 65 };

export const TwoSpectra: Story = {
  name: "Two Spectra",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum()],
    xScale,
    plotWidth: 715,
    plotHeight: 430,
    margin,
    theme: "light",
    showGrid: true,
    xLabel: "Wavenumber (cm⁻¹)",
    yLabel: "Absorbance",
  },
};

export const ThreeSpectra: Story = {
  name: "Three Spectra",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum(), createThirdSpectrum()],
    xScale,
    plotWidth: 715,
    plotHeight: 430,
    margin,
    theme: "light",
    showGrid: true,
    xLabel: "Wavenumber (cm⁻¹)",
    yLabel: "Absorbance",
  },
};
