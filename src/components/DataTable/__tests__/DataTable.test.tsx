import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { DataTable } from "../DataTable";
import type { Spectrum } from "../../../types";

const spectrum: Spectrum = {
  id: "s1",
  label: "Test",
  x: [100, 200, 300, 400, 500],
  y: [0.1, 0.5, 0.9, 0.3, 0.1],
  xUnit: "cm⁻¹",
  yUnit: "Absorbance",
};

describe("DataTable", () => {
  it("renders table with header", () => {
    const { container } = render(<DataTable spectrum={spectrum} />);
    const ths = container.querySelectorAll("th");
    expect(ths.length).toBe(3); // #, x, y
    expect(ths[1].textContent).toContain("cm⁻¹");
    expect(ths[2].textContent).toContain("Absorbance");
  });

  it("renders correct number of rows", () => {
    const { container } = render(<DataTable spectrum={spectrum} />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(5);
  });

  it("shows 'Showing N of M' when maxRows exceeded", () => {
    const { container } = render(<DataTable spectrum={spectrum} maxRows={3} />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(3);
    expect(container.textContent).toContain("Showing 3 of 5");
  });

  it("toggles sort direction on header click", () => {
    const { container } = render(<DataTable spectrum={spectrum} />);
    const xHeader = container.querySelectorAll("th")[1];

    // Initially ascending (↓)
    expect(xHeader.textContent).toContain("↓");

    fireEvent.click(xHeader);
    expect(xHeader.textContent).toContain("↑");
  });

  it("applies dark theme", () => {
    const { container } = render(<DataTable spectrum={spectrum} theme="dark" />);
    const table = container.querySelector(".spectraview-datatable") as HTMLElement;
    expect(table).not.toBeNull();
  });
});
