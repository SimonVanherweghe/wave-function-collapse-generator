import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EdgeOverview from "../components/EdgeOverview";

describe("EdgeOverview Component", () => {
  // Create a custom tile with a known grid
  const customTile = {
    grid: [
      [true, false, false, false, true],
      [false, false, false, false, false],
      [false, false, true, false, false],
      [false, false, false, false, false],
      [true, false, false, false, true],
    ],
    rotationEnabled: false,
    mirrorEnabled: false,
  };

  it("renders edge patterns correctly", () => {
    const { container } = render(<EdgeOverview tiles={[customTile]} />);
    
    // Verify edge cells are rendered
    const edgeCells = screen.getAllByTestId("edge-cell");
    expect(edgeCells.length).toBeGreaterThan(0);
    
    // There should be exactly 1 unique edge displayed
    const edgeItems = container.querySelectorAll(".edge-item");
    expect(edgeItems.length).toBe(1);
    
    // The count should be 4 (four edges for one tile)
    expect(screen.getByText("Occurrences: 4")).toBeInTheDocument();
  });

  it("aggregates edges from multiple tiles", () => {
    const { container } = render(
      <EdgeOverview tiles={[customTile, customTile]} />
    );

    // Again, only one unique edge should be rendered
    const edgeItems = container.querySelectorAll(".edge-item");
    expect(edgeItems.length).toBe(1);

    // The count should now be 8 (4 edges per tile × 2 tiles)
    expect(screen.getByText("Occurrences: 8")).toBeInTheDocument();
  });

  it("shows empty state when no tiles", () => {
    render(<EdgeOverview tiles={[]} />);
    expect(screen.getByTestId("no-edges-message")).toBeInTheDocument();
    expect(screen.getByText(/No edge patterns found/)).toBeInTheDocument();
  });

  it("updates edges when tiles change", () => {
    const { rerender } = render(<EdgeOverview tiles={[]} />);
    expect(screen.getByTestId("no-edges-message")).toBeInTheDocument();

    rerender(<EdgeOverview tiles={[customTile]} />);
    expect(screen.queryByTestId("no-edges-message")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("edge-cell").length).toBeGreaterThan(0);
  });
});
