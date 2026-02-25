import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "../components/Tooltip/Tooltip";
import { LIGHT_THEME } from "../utils/colors";
import { createIRSpectrum, createSecondSpectrum, samplePeaks } from "./data";

function SvgDecorator(Story: React.ComponentType) {
  return (
    <svg width={800} height={400}>
      <g transform="translate(65, 20)">
        <Story />
      </g>
    </svg>
  );
}

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  decorators: [SvgDecorator],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const MultiSpectrum: Story = {
  name: "Multi-Spectrum Readout",
  args: {
    data: { px: 300, py: 150, dataX: 1700, dataY: 0.85 },
    spectra: [createIRSpectrum(), createSecondSpectrum()],
    plotWidth: 715,
    plotHeight: 330,
    colors: LIGHT_THEME,
  },
};

export const WithPeaks: Story = {
  name: "With Nearest Peak",
  args: {
    data: { px: 300, py: 150, dataX: 1700, dataY: 0.85 },
    spectra: [createIRSpectrum()],
    peaks: samplePeaks,
    plotWidth: 715,
    plotHeight: 330,
    colors: LIGHT_THEME,
  },
};
