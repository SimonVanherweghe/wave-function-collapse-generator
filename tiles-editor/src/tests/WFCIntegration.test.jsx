import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WFC from "../components/WFC";

// Helper: create a dummy tile definition using a 3x3 grid.
const createDummyTile = (value) => ({
  grid: [
    [value === 1, value === 1, value === 1],
    [value === 1, value === 1, value === 1],
    [value === 1, value === 1, value === 1],
  ],
  rotationEnabled: false,
  mirrorEnabled: false,
});

describe("WFC Integration", () => {
  it("disables buttons when tile set is empty and enables them when tiles are added", async () => {
    const initialTiles = [createDummyTile(1), createDummyTile(2)];
    const { rerender } = render(<WFC tiles={initialTiles} />);

    // Buttons should be enabled initially.
    expect(screen.getByTestId("run-wfc-button")).not.toBeDisabled();
    expect(
      screen.getByTestId("run-wfc-backtracking-button")
    ).not.toBeDisabled();
    expect(screen.getByTestId("reset-button")).not.toBeDisabled();

    // Remove all tiles.
    rerender(<WFC tiles={[]} />);

    await waitFor(() => {
      expect(screen.getByTestId("run-wfc-button")).toBeDisabled();
      expect(screen.getByTestId("run-wfc-backtracking-button")).toBeDisabled();
      expect(screen.getByTestId("reset-button")).toBeDisabled();
      expect(
        screen.getByText("Please add tiles to use the WFC algorithm")
      ).toBeInTheDocument();
    });

    // Add tiles back.
    rerender(<WFC tiles={initialTiles} />);

    await waitFor(() => {
      expect(screen.getByTestId("run-wfc-button")).not.toBeDisabled();
      expect(
        screen.getByTestId("run-wfc-backtracking-button")
      ).not.toBeDisabled();
      expect(screen.getByTestId("reset-button")).not.toBeDisabled();
      expect(
        screen.queryByText("Please add tiles to use the WFC algorithm")
      ).toBeNull();
    });
  });
  it("initializes the grid correctly with the given tile set", async () => {
    // Test the grid initialization behavior.
    const initialTiles = [
      createDummyTile(1),
      createDummyTile(2),
      createDummyTile(1),
    ];
    render(<WFC tiles={initialTiles} />);

    // Expect each grid cell to display possibility count equal to processedTiles.length.
    // Since rotation and mirror are disabled, processedTiles length equals initialTiles.length (3).
    const cells = screen.getAllByTestId((content, element) =>
      element.getAttribute("data-testid")?.startsWith("wfc-cell-")
    );
    expect(cells.length).toBe(100);
    cells.forEach((cell) => {
      expect(cell.textContent).toBe("3");
      expect(cell).toHaveClass("wfc-cell-uncollapsed");
    });
  });

  it("collapses the entire grid successfully and displays tile previews in collapsed cells", async () => {
    // For a successful run, use two compatible tiles.
    const availableTiles = [createDummyTile(1), createDummyTile(1)];
    render(<WFC tiles={availableTiles} />);

    // Click the Run WFC button.
    const runButton = screen.getByTestId("run-wfc-button");
    fireEvent.click(runButton);

    // Wait until the algorithm completes.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute("data-testid")?.startsWith("wfc-cell-")
      );
      // Check that every cell is collapsed (using the collapsed CSS class)
      // and that each cell contains a TilePreview element.
      cells.forEach((cell) => {
        expect(cell).toHaveClass("wfc-cell-collapsed");
        expect(cell.querySelector(".tile-preview")).not.toBeNull();
      });
    });
  });

  it("collapses grid with incompatible tiles by forcing consistency (backtracking if needed)", async () => {
    // Provide two tiles that are incompatible.
    const tileA = createDummyTile(1);
    const tileB = createDummyTile(2);
    const availableTiles = [tileA, tileB];
    render(<WFC tiles={availableTiles} />);

    // Use the backtracking algorithm if available.
    // Assume we have a "runWFC-backtracking-button" when backtracking is enabled.
    const runBacktrackingButton = screen.getByTestId(
      "run-wfc-backtracking-button"
    );
    fireEvent.click(runBacktrackingButton);

    // Wait for the algorithm to finish.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute("data-testid")?.startsWith("wfc-cell-")
      );
      cells.forEach((cell) => {
        // Each cell should be collapsed and display a tile preview.
        expect(cell).toHaveClass("wfc-cell-collapsed");
        expect(cell.querySelector(".tile-preview")).not.toBeNull();
      });
    });
  });

  it("updates when new tiles are added even after an initial run, resulting in a fresh grid", async () => {
    const initialTiles = [createDummyTile(1), createDummyTile(2)];
    const { rerender } = render(<WFC tiles={initialTiles} />);

    // Run the algorithm.
    const runButton = screen.getByTestId("run-wfc-button");
    fireEvent.click(runButton);

    // Wait for some cells to collapse.
    await waitFor(() => {
      const collapsedCells = screen
        .getAllByTestId((content, element) =>
          element.getAttribute("data-testid")?.startsWith("wfc-cell-")
        )
        .filter((cell) => cell.classList.contains("wfc-cell-collapsed"));
      expect(collapsedCells.length).toBeGreaterThan(0);
    });

    // Update tile set by adding one more tile.
    const updatedTiles = [
      createDummyTile(1),
      createDummyTile(2),
      createDummyTile(1),
    ];
    // New key forces reinitialization.
    rerender(<WFC tiles={updatedTiles} key={JSON.stringify(updatedTiles)} />);

    // Verify the new grid is fresh: each cell should be uncollapsed and display possibility count "3"
    // (since updatedTiles has length 3, and rotation/mirror are disabled).
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute("data-testid")?.startsWith("wfc-cell-")
      );
      cells.forEach((cell) => {
        expect(cell.textContent).toBe("3");
        expect(cell).toHaveClass("wfc-cell-uncollapsed");
        expect(cell).not.toHaveClass("wfc-cell-collapsed");
      });
    });
  });

  it("updates the grid when a tile is removed after algorithm run, resulting in a reset grid", async () => {
    // Start with a dummy tile set with two tiles.
    const availableTiles = [createDummyTile(1), createDummyTile(1)];
    const { rerender } = render(<WFC tiles={availableTiles} />);

    // Run the algorithm.
    const runButton = screen.getByTestId("run-wfc-button");
    fireEvent.click(runButton);

    // Wait for the algorithm to complete.
    await waitFor(() => {
      const collapsedCells = screen
        .getAllByTestId((content, element) =>
          element.getAttribute("data-testid")?.startsWith("wfc-cell-")
        )
        .filter((cell) => cell.classList.contains("wfc-cell-collapsed"));
      expect(collapsedCells.length).toBeGreaterThan(0);
    });

    // Simulate tile removal – now only one tile remains.
    const updatedTiles = [availableTiles[1]];
    // We pass a new key so that the component is re-mounted.
    rerender(<WFC tiles={updatedTiles} key={JSON.stringify(updatedTiles)} />);

    // After reinitialization, every cell should be uncollapsed and show possibility count
    // equal to the new processedTiles length. With one tile and no rotation/mirroring, possibilitySet will be [0] so each cell shows "1".
    await waitFor(() => {
      const cellsAfterReset = screen.getAllByTestId((content, element) =>
        element.getAttribute("data-testid")?.startsWith("wfc-cell-")
      );
      cellsAfterReset.forEach((cell) => {
        expect(cell.textContent).toBe("1");
        expect(cell).toHaveClass("wfc-cell-uncollapsed");
        // No cell should carry the collapsed class.
        expect(cell).not.toHaveClass("wfc-cell-collapsed");
      });
    });
  });
});
