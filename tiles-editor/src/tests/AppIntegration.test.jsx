import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";
import { MemoryRouter } from "react-router-dom";

describe("App Integration Tests", () => {
  it("updates EdgeOverview in real-time when navigating to the edge patterns page", async () => {
    render(
      <MemoryRouter initialEntries={["/edge-overview"]}>
        <App />
      </MemoryRouter>
    );

    // For a default tile, expecting the unique edge to have occurrences text
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Occurrences: 4"))
      ).toBeInTheDocument();
    });

    // Add a new tile via the "Add Tile" button.
    const addTileButton = screen.getByRole("button", { name: /add tile/i });
    fireEvent.click(addTileButton);

    // With two default tiles, total edges count should update to "Occurrences: 8".
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Occurrences: 8"))
      ).toBeInTheDocument();
    });

    // Edit the first tile: toggle the top-left cell (tile 0, row 0, col 0).
    const cell = screen.getByTestId("tile-0-cell-0-0");
    fireEvent.click(cell);

    // The edge overview should update automatically.
    // Since changing a cell can change the edge pattern, expect more than one unique edge.
    await waitFor(() => {
      const edgeItems = screen.getAllByText((content) =>
        content.includes("Occurrences:")
      );
      expect(edgeItems.length).toBeGreaterThan(1);
    });
  });

  it("shows edge patterns when navigating to the edge patterns page", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    // Initially we should be on the home page with WFC section
    expect(screen.getByTestId("wfc-section")).toBeInTheDocument();
    
    // Navigate to edge patterns page
    const edgePatternsLink = screen.getByText("Edge Patterns");
    fireEvent.click(edgePatternsLink);
    
    // Now we should see the edge overview with occurrences
    await waitFor(() => {
      expect(
        screen.getByText("Edge Pattern Overview")
      ).toBeInTheDocument();
      
      expect(
        screen.getByText((content) => content.includes("Occurrences: 4"))
      ).toBeInTheDocument();
    });
  });
});
