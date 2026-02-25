import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toolbar } from "../components/Toolbar/Toolbar";

const meta: Meta<typeof Toolbar> = {
  title: "Components/Toolbar",
  component: Toolbar,
  parameters: {
    layout: "centered",
  },
  args: {
    onZoomIn: () => console.log("zoom in"),
    onZoomOut: () => console.log("zoom out"),
    onReset: () => console.log("reset"),
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  args: {
    isZoomed: false,
    theme: "light",
  },
};

export const Zoomed: Story = {
  args: {
    isZoomed: true,
    theme: "light",
  },
};

export const DarkTheme: Story = {
  args: {
    isZoomed: true,
    theme: "dark",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
