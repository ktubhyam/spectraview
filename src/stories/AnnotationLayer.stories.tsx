import type { Meta, StoryObj } from "@storybook/react-vite";
import { scaleLinear } from "d3-scale";
import { AnnotationLayer } from "../components/AnnotationLayer/AnnotationLayer";
import { LIGHT_THEME } from "../utils/colors";
import { sampleAnnotations } from "./data";

function SvgDecorator(Story: React.ComponentType) {
  return (
    <svg width={800} height={400}>
      <g transform="translate(65, 20)">
        <Story />
      </g>
    </svg>
  );
}

const meta: Meta<typeof AnnotationLayer> = {
  title: "Components/AnnotationLayer",
  component: AnnotationLayer,
  decorators: [SvgDecorator],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof AnnotationLayer>;

const xScale = scaleLinear().domain([4000, 400]).range([0, 715]);
const yScale = scaleLinear().domain([0, 1]).range([330, 0]);

export const WithAnchors: Story = {
  name: "With Anchor Lines",
  args: {
    annotations: sampleAnnotations,
    xScale,
    yScale,
    colors: LIGHT_THEME,
  },
};

export const NoAnchorLines: Story = {
  name: "No Anchor Lines",
  args: {
    annotations: sampleAnnotations.map((a) => ({ ...a, showAnchorLine: false })),
    xScale,
    yScale,
    colors: LIGHT_THEME,
  },
};
