import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import App from "../App";

// Helper function to render App with Router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("App Integration Tests", () => {
  it("updates EdgeOverview in real-time in auto-update mode", async () => {
    renderWithRouter(<App />);

    // By default, auto-update is enabled.
    // For a default tile, expecting the unique edge to have a count "Count: 4"
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Count: 4"))
      ).toBeInTheDocument();
    });

    // Add a new tile via the "Add Tile" button.
    const addTileButton = screen.getByRole("button", { name: /add tile/i });
    fireEvent.click(addTileButton);

    // With two default tiles, total edges count should update to "Count: 8".
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Count: 8"))
      ).toBeInTheDocument();
    });

    // Edit the first tile: toggle the top-left cell (tile 0, row 0, col 0).
    const cell = screen.getByTestId("tile-0-cell-0-0");
    fireEvent.click(cell);

    // In auto-update mode, the edge overview should update automatically.
    // Since changing a cell can change the edge pattern, expect more than one unique edge.
    await waitFor(() => {
      const edgeItems = screen.getAllByText((content) =>
        content.includes("Count:")
      );
      expect(edgeItems.length).toBeGreaterThan(1);
    });
  });

  it("does not update EdgeOverview in manual mode until refresh is clicked", async () => {
    renderWithRouter(<App />);

    // Toggle auto-update off using the test ID.
    const autoUpdateCheckbox = screen.getByTestId("auto-update-checkbox");
    fireEvent.click(autoUpdateCheckbox);
    expect(autoUpdateCheckbox.checked).toBe(false);

    // With one tile, the unique edge count should be "Count: 4" initially.
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Count: 4"))
      ).toBeInTheDocument();
    });

    // Add a new tile.
    const addTileButton = screen.getByRole("button", { name: /add tile/i });
    fireEvent.click(addTileButton);

    // Since auto-update is off, the EdgeOverview remains unchanged (still "Count: 4").
    await new Promise((resolve) => setTimeout(resolve, 300)); // wait momentarily
    let edgeItem = screen.getByText((content) => content.includes("Count: 4"));
    expect(edgeItem).toBeInTheDocument();

    // Click the Refresh button.
    const refreshButton = screen.getByTestId("refresh-button");
    fireEvent.click(refreshButton);

    // After refresh, the edge count should update (now "Count: 8" for two default tiles).
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("Count: 8"))
      ).toBeInTheDocument();
    });
  });
});
