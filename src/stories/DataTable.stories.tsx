import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "../components/DataTable/DataTable";
import { createIRSpectrum } from "./data";

const meta: Meta<typeof DataTable> = {
  title: "Components/DataTable",
  component: DataTable,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
  name: "Default",
  args: {
    spectrum: createIRSpectrum(),
    maxRows: 50,
    height: 300,
  },
};

export const DarkTheme: Story = {
  name: "Dark Theme",
  args: {
    spectrum: createIRSpectrum(),
    theme: "dark",
    maxRows: 50,
    height: 300,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const WithHighlight: Story = {
  name: "With Highlight Range",
  args: {
    spectrum: createIRSpectrum(),
    highlightRange: [1600, 1800] as [number, number],
    maxRows: 50,
    height: 300,
  },
};
