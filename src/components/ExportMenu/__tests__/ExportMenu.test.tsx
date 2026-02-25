import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExportMenu } from "../ExportMenu";

describe("ExportMenu", () => {
  it("renders Export button", () => {
    render(<ExportMenu theme="light" />);
    expect(screen.getByText("Export")).toBeDefined();
  });

  it("opens dropdown on click", () => {
    render(
      <ExportMenu
        theme="light"
        onExportPng={() => {}}
        onExportSvg={() => {}}
        onExportCsv={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Export"));
    expect(screen.getByText("PNG Image")).toBeDefined();
    expect(screen.getByText("SVG Vector")).toBeDefined();
    expect(screen.getByText("CSV Data")).toBeDefined();
  });

  it("calls onExportPng handler", () => {
    const onExportPng = vi.fn();
    render(<ExportMenu theme="light" onExportPng={onExportPng} />);
    fireEvent.click(screen.getByText("Export"));
    fireEvent.click(screen.getByText("PNG Image"));
    expect(onExportPng).toHaveBeenCalledTimes(1);
  });

  it("closes menu after selection", () => {
    render(
      <ExportMenu theme="light" onExportPng={() => {}} />,
    );
    fireEvent.click(screen.getByText("Export"));
    fireEvent.click(screen.getByText("PNG Image"));
    expect(screen.queryByText("PNG Image")).toBeNull();
  });

  it("has proper ARIA attributes", () => {
    render(<ExportMenu theme="light" />);
    const btn = screen.getByLabelText("Export");
    expect(btn.getAttribute("aria-haspopup")).toBe("true");
  });
});
