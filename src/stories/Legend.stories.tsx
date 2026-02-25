import type { Meta, StoryObj } from "@storybook/react-vite";
import { Legend } from "../components/Legend/Legend";
import { createIRSpectrum, createSecondSpectrum, createThirdSpectrum } from "./data";

const meta: Meta<typeof Legend> = {
  title: "Components/Legend",
  component: Legend,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Legend>;

export const TwoSpectra: Story = {
  name: "Two Spectra",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum()],
    theme: "light",
    position: "bottom",
  },
};

export const ThreeSpectra: Story = {
  name: "Three Spectra",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum(), createThirdSpectrum()],
    theme: "light",
    position: "bottom",
  },
};

export const DarkTheme: Story = {
  name: "Dark Theme",
  args: {
    spectra: [createIRSpectrum(), createSecondSpectrum(), createThirdSpectrum()],
    theme: "dark",
    position: "bottom",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
