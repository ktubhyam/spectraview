import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExportMenu } from "../components/ExportMenu/ExportMenu";

const meta: Meta<typeof ExportMenu> = {
  title: "Components/ExportMenu",
  component: ExportMenu,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ExportMenu>;

export const AllFormats: Story = {
  name: "All Export Formats",
  args: {
    theme: "light",
    onExportPng: () => console.log("Export PNG"),
    onExportSvg: () => console.log("Export SVG"),
    onExportCsv: () => console.log("Export CSV"),
    onExportJson: () => console.log("Export JSON"),
  },
};

export const DarkTheme: Story = {
  name: "Dark Theme",
  args: {
    theme: "dark",
    onExportPng: () => console.log("Export PNG"),
    onExportSvg: () => console.log("Export SVG"),
    onExportCsv: () => console.log("Export CSV"),
    onExportJson: () => console.log("Export JSON"),
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
