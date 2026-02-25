import type { Meta, StoryObj } from "@storybook/react-vite";
import { scaleLinear } from "d3-scale";
import { AxisLayer } from "../components/AxisLayer/AxisLayer";
import { LIGHT_THEME, DARK_THEME } from "../utils/colors";

/** SVG wrapper decorator for axis stories. */
function SvgDecorator(Story: React.ComponentType) {
  return (
    <svg width={800} height={400}>
      <g transform="translate(65, 20)">
        <Story />
      </g>
    </svg>
  );
}

const meta: Meta<typeof AxisLayer> = {
  title: "Components/AxisLayer",
  component: AxisLayer,
  decorators: [SvgDecorator],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof AxisLayer>;

const xScale = scaleLinear().domain([4000, 400]).range([0, 715]);
const yScale = scaleLinear().domain([0, 1]).range([330, 0]);

export const Default: Story = {
  args: {
    xScale,
    yScale,
    width: 715,
    height: 330,
    xLabel: "Wavenumber (cm⁻¹)",
    yLabel: "Absorbance",
    showGrid: true,
    colors: LIGHT_THEME,
  },
};

export const NoGrid: Story = {
  args: {
    ...Default.args,
    showGrid: false,
  },
};

export const DarkTheme: Story = {
  args: {
    ...Default.args,
    colors: DARK_THEME,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
