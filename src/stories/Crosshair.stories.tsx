import type { Meta, StoryObj } from "@storybook/react-vite";
import { Crosshair } from "../components/Crosshair/Crosshair";
import { LIGHT_THEME } from "../utils/colors";

/** SVG wrapper decorator for crosshair stories. */
function SvgDecorator(Story: React.ComponentType) {
  return (
    <svg width={800} height={400}>
      <g transform="translate(65, 20)">
        <Story />
      </g>
    </svg>
  );
}

const meta: Meta<typeof Crosshair> = {
  title: "Components/Crosshair",
  component: Crosshair,
  decorators: [SvgDecorator],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Crosshair>;

export const Active: Story = {
  args: {
    position: { px: 350, py: 165, dataX: 2200, dataY: 0.52 },
    width: 715,
    height: 330,
    colors: LIGHT_THEME,
  },
};

export const Hidden: Story = {
  args: {
    position: null,
    width: 715,
    height: 330,
    colors: LIGHT_THEME,
  },
};
