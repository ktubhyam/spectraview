import type { Meta, StoryObj } from "@storybook/react-vite";
import { DropZone } from "../components/DropZone/DropZone";

const meta: Meta<typeof DropZone> = {
  title: "Components/DropZone",
  component: DropZone,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DropZone>;

export const Enabled: Story = {
  name: "Enabled",
  args: {
    enabled: true,
    theme: "light",
    width: 800,
    height: 400,
    children: (
      <div
        style={{
          width: 800,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontFamily: "system-ui",
        }}
      >
        Drag a spectrum file here
      </div>
    ),
  },
};

export const DarkTheme: Story = {
  name: "Dark Theme",
  args: {
    enabled: true,
    theme: "dark",
    width: 800,
    height: 400,
    children: (
      <div
        style={{
          width: 800,
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontFamily: "system-ui",
        }}
      >
        Drag a spectrum file here
      </div>
    ),
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
