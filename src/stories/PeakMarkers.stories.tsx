import type { Meta, StoryObj } from "@storybook/react-vite";
import { scaleLinear } from "d3-scale";
import { PeakMarkers } from "../components/PeakMarkers/PeakMarkers";
import { LIGHT_THEME } from "../utils/colors";
import { samplePeaks } from "./data";

/** SVG wrapper decorator for peak marker stories. */
function SvgDecorator(Story: React.ComponentType) {
  return (
    <svg width={800} height={400}>
      <g transform="translate(65, 20)">
        <Story />
      </g>
    </svg>
  );
}

const meta: Meta<typeof PeakMarkers> = {
  title: "Components/PeakMarkers",
  component: PeakMarkers,
  decorators: [SvgDecorator],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PeakMarkers>;

const xScale = scaleLinear().domain([4000, 400]).range([0, 715]);
const yScale = scaleLinear().domain([0, 1]).range([330, 0]);

export const WithLabels: Story = {
  args: {
    peaks: samplePeaks,
    xScale,
    yScale,
    colors: LIGHT_THEME,
  },
};

export const Clickable: Story = {
  args: {
    peaks: samplePeaks,
    xScale,
    yScale,
    colors: LIGHT_THEME,
    onPeakClick: (peak) => console.log("peak clicked", peak),
  },
};

export const ManyPeaks: Story = {
  args: {
    peaks: Array.from({ length: 20 }, (_, i) => ({
      x: 500 + i * 180,
      y: 0.3 + Math.random() * 0.6,
      label: `${500 + i * 180}`,
      spectrumId: "ir-ethanol",
    })),
    xScale,
    yScale,
    colors: LIGHT_THEME,
  },
};
