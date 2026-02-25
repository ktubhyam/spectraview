import type { Meta, StoryObj } from "@storybook/react-vite";
import { scaleLinear } from "d3-scale";
import { RegionSelector } from "../components/RegionSelector/RegionSelector";
import { LIGHT_THEME } from "../utils/colors";
import { sampleRegions } from "./data";

/** SVG wrapper decorator for region stories. */
function SvgDecorator(Story: React.ComponentType) {
  return (
    <svg width={800} height={400}>
      <g transform="translate(65, 20)">
        <Story />
      </g>
    </svg>
  );
}

const meta: Meta<typeof RegionSelector> = {
  title: "Components/RegionSelector",
  component: RegionSelector,
  decorators: [SvgDecorator],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof RegionSelector>;

const xScale = scaleLinear().domain([4000, 400]).range([0, 715]);

export const SingleRegion: Story = {
  args: {
    regions: [sampleRegions[0]],
    xScale,
    height: 330,
    colors: LIGHT_THEME,
  },
};

export const MultipleRegions: Story = {
  args: {
    regions: sampleRegions,
    xScale,
    height: 330,
    colors: LIGHT_THEME,
  },
};
