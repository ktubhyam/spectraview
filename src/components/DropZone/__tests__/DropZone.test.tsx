import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DropZone } from "../DropZone";

describe("DropZone", () => {
  it("renders children", () => {
    render(
      <DropZone enabled theme="light" width={800} height={400}>
        <span>Child content</span>
      </DropZone>,
    );
    expect(screen.getByText("Child content")).toBeDefined();
  });

  it("shows overlay on drag enter", () => {
    render(
      <DropZone enabled theme="light" width={800} height={400}>
        <span>Content</span>
      </DropZone>,
    );
    const container = screen.getByText("Content").parentElement!;
    fireEvent.dragEnter(container, { dataTransfer: { files: [] } });
    expect(screen.getByTestId("dropzone-overlay")).toBeDefined();
  });

  it("hides overlay on drag leave", () => {
    render(
      <DropZone enabled theme="light" width={800} height={400}>
        <span>Content</span>
      </DropZone>,
    );
    const container = screen.getByText("Content").parentElement!;
    fireEvent.dragEnter(container, { dataTransfer: { files: [] } });
    fireEvent.dragLeave(container, { dataTransfer: { files: [] } });
    expect(screen.queryByTestId("dropzone-overlay")).toBeNull();
  });

  it("calls onDrop with files", () => {
    const onDrop = vi.fn();
    render(
      <DropZone enabled theme="light" width={800} height={400} onDrop={onDrop}>
        <span>Content</span>
      </DropZone>,
    );
    const container = screen.getByText("Content").parentElement!;
    const file = new File(["data"], "test.csv", { type: "text/csv" });
    fireEvent.drop(container, { dataTransfer: { files: [file] } });
    expect(onDrop).toHaveBeenCalledWith([file]);
  });

  it("does nothing when disabled", () => {
    const onDrop = vi.fn();
    render(
      <DropZone enabled={false} theme="light" width={800} height={400} onDrop={onDrop}>
        <span>Content</span>
      </DropZone>,
    );
    const container = screen.getByText("Content").parentElement!;
    fireEvent.dragEnter(container, { dataTransfer: { files: [] } });
    expect(screen.queryByTestId("dropzone-overlay")).toBeNull();
  });
});
