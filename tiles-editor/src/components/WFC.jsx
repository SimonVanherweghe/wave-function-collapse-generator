import { useState } from "react";
import "./WFC.css";
import {
  collapseCell,
  findLowestEntropyCell,
  mirrorTile,
  propagateConstraints,
  rotateTile,
} from "../wfcUtils";
import TilePreview from "./TilePreview";

function WFC({ tiles, numRows = 10, numCols = 10, showGridlines = true }) {
  // Determine if we have tiles
  const hasTiles = tiles && tiles.length > 0;

  // Process the effective tile list to include rotated and mirrored variants if enabled.
  let processedTiles = [];
  tiles.forEach((tile) => {
    // Always include the original tile.
    processedTiles.push(tile);

    // If rotationEnabled, add rotated variants (only add unique ones)
    if (tile.rotationEnabled) {
      for (let i = 1; i < 4; i++) {
        const rotated = rotateTile(tile, i);
        // Check uniqueness by comparing stringified grids.
        if (
          !processedTiles.some(
            (t) => JSON.stringify(t.grid) === JSON.stringify(rotated.grid)
          )
        ) {
          processedTiles.push(rotated);
        }
      }
    }
    // If mirrorEnabled, add the mirrored variant.
    if (tile.mirrorEnabled) {
      const mirrored = mirrorTile(tile);
      if (
        !processedTiles.some(
          (t) => JSON.stringify(t.grid) === JSON.stringify(mirrored.grid)
        )
      ) {
        processedTiles.push(mirrored);
      }
    }
  });

  // Always compute possibility set from the processed tile list
  const possibilitySet = processedTiles.map((_, index) => index);

  // Function to generate a fresh grid
  const generateGrid = () =>
    Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => ({
        possibilities: [...possibilitySet],
        collapsed: false,
      }))
    );

  // Initialize the grid
  const [grid, setGrid] = useState(generateGrid());
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to check if the grid is fully collapsed or if a contradiction occurs.
  const gridStatus = (grid) => {
    let allCollapsed = true;
    let contradiction = false;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        const cell = grid[i][j];
        const len = cell.possibilities.length;
        if (len === 0) {
          contradiction = true;
          break;
        }
        if (!cell.collapsed) {
          allCollapsed = false;
        }
      }
      if (contradiction) break;
    }
    return { allCollapsed, contradiction };
  };

  // Original WFC algorithm without backtracking
  const runWFCAlgorithm = async () => {
    if (!hasTiles) return; // Prevent running algorithm if no tiles.
    
    setIsLoading(true);
    // Simulate asynchronous work to ensure spinner is visible
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Use a fresh copy of the grid state.
    let currentGrid = generateGrid();

    // Safety counter to avoid infinite loops.
    let iterations = 0;
    const maxIterations = 1000;

    try {
      while (iterations < maxIterations) {
        iterations++;
        const { allCollapsed, contradiction } = gridStatus(currentGrid);
        if (contradiction) {
          console.error("Contradiction encountered – aborting algorithm");
          break;
        }
        if (allCollapsed) {
          break;
        }

        // Find cell with lowest entropy
        const lowestEntropyCell = findLowestEntropyCell(currentGrid);
        if (lowestEntropyCell.row === -1) {
          break;
        }

        // Collapse one cell: use collapseCell which returns a new grid
        const newGrid = collapseCell(currentGrid, processedTiles);

        // Find which cell was collapsed.
        let collapsedCell = null;
        for (let i = 0; i < currentGrid.length; i++) {
          for (let j = 0; j < currentGrid[0].length; j++) {
            if (
              currentGrid[i][j].possibilities.length > 1 &&
              newGrid[i][j].possibilities.length === 1
            ) {
              collapsedCell = { row: i, col: j };
              break;
            }
          }
          if (collapsedCell) break;
        }
        // Propagate constraints from the collapsed cell.
        if (collapsedCell) {
          propagateConstraints(
            newGrid,
            collapsedCell.row,
            collapsedCell.col,
            processedTiles
          );
        }
        // Update our current grid for next iteration.
        currentGrid = newGrid;
      }
    } catch (error) {
      console.error("Error occurred in runWFCAlgorithm:", error);
    }

    // Finally, update component state
    setGrid(currentGrid);
    setIsLoading(false);
  };

  // New backtracking version of the algorithm
  const runWFCAlgorithmWithBacktracking = async () => {
    if (!hasTiles) return;
    
    setIsLoading(true);
    // Simulate asynchronous work to ensure spinner is visible
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Make a local copy of the grid.
    let currentGrid = generateGrid();
    // Stack to remember previous states for backtracking.
    // Each element will be an object: { grid, row, col, triedPossibilities }
    const historyStack = [];
    let iterations = 0;
    const maxIterations = 1000;
    const maxBacktracks = 50;
    let backtracks = 0;

    try {
      while (iterations < maxIterations) {
        iterations++;
        const { allCollapsed, contradiction } = gridStatus(currentGrid);
        if (allCollapsed) {
          break; // finished!
        }
        if (contradiction) {
          // If contradiction occurs, backtrack if possible.
          if (historyStack.length === 0 || backtracks >= maxBacktracks) {
            console.error("Backtracking exhausted - contradiction unresolved");
            break;
          }
          const prev = historyStack.pop();
          currentGrid = prev.grid;
          backtracks++;
          // In a more complete solution, we would remove the previously tried possibility
          // and try a different one in that cell. For simplicity, we assume the history
          // already stored the "failed" collapse so that on backtracking, another collapse will occur.
          continue;
        }
        // Find cell with lowest entropy.
        const { row, col } = findLowestEntropyCell(currentGrid);
        if (row === -1) {
          break; // nothing to collapse
        }

        const cell = currentGrid[row][col];
        // If the cell is ambiguous (possibilities.length > 1), try a possibility.
        // Try the first possibility that has not been tried for this cell.
        let triedPossibilities = [];
        // See if we already have a record for this cell in history.
        const existingRecord = historyStack.find(
          (rec) => rec.row === row && rec.col === col
        );
        if (existingRecord) {
          triedPossibilities = existingRecord.triedPossibilities;
        }
        // Find a possibility not yet tried.
        const possibleChoices = cell.possibilities.filter(
          (p) => !triedPossibilities.includes(p)
        );
        if (possibleChoices.length === 0) {
          // Nothing left to try in this cell: contradiction; backtrack.
          if (historyStack.length === 0 || backtracks >= maxBacktracks) {
            console.error(
              "No possibilities remain for cell - backtracking aborted"
            );
            break;
          }
          const prev = historyStack.pop();
          currentGrid = prev.grid;
          backtracks++;
          continue;
        }
        // Randomly select from the available possibilities
        // Weighted random selection for the backtracking branch.
        let totalWeight = possibleChoices.reduce(
          (sum, tileIndex) => sum + (processedTiles[tileIndex].weight || 1),
          0
        );
        let r = Math.random() * totalWeight;
        let chosen;
        for (let i = 0; i < possibleChoices.length; i++) {
          const tileIndex = possibleChoices[i];
          r -= processedTiles[tileIndex].weight || 1;
          if (r <= 0) {
            chosen = tileIndex;
            break;
          }
        }
        // Save current state along with the fact that we are trying this possibility.
        historyStack.push({
          grid: JSON.parse(JSON.stringify(currentGrid)), // Deep clone the grid
          row,
          col,
          triedPossibilities: [...triedPossibilities, chosen],
        });
        // Collapse the cell by forcing its possibilities to only the chosen.
        const newGrid = currentGrid.map((r, i) =>
          r.map((cellObj, j) =>
            i === row && j === col
              ? { possibilities: [chosen], collapsed: true }
              : cellObj
          )
        );
        // Propagate constraints from the collapsed cell.
        propagateConstraints(newGrid, row, col, processedTiles);

        // Update currentGrid.
        currentGrid = newGrid;
      }
    } catch (error) {
      console.error(
        "Error occurred in runWFCAlgorithmWithBacktracking:",
        error
      );
    }

    setGrid(currentGrid);
    setIsLoading(false);
  };

  // Add a reset function to reinitialize the grid
  const resetGrid = () => {
    setGrid(generateGrid());
  };

  return (
    <div className="wfc-container" key={JSON.stringify(tiles)}>
      <div className="wfc-grid-container" style={{ position: 'relative' }}>
        <div
          className={`wfc-grid ${!showGridlines ? "wfc-grid--no-gridlines" : ""}`}
          data-testid="wfc-grid-container"
          style={{ "--grid-cols": numCols, "--grid-rows": numRows }}
        >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-testid={`wfc-cell-${rowIndex}-${colIndex}`}
                className={`wfc-cell ${
                  cell.collapsed ? "wfc-cell-collapsed" : "wfc-cell-uncollapsed"
                }`}
              >
                {cell.collapsed ? (
                  <TilePreview tile={processedTiles[cell.possibilities[0]]} />
                ) : (
                  cell.possibilities.length
                )}
              </div>
            );
          })
        )}
        </div>
        {isLoading && (
          <div
            data-testid="wfc-spinner"
            className="wfc-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(128,128,128,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div className="spinner">Loading…</div>
          </div>
        )}
      </div>
      <button
        onClick={runWFCAlgorithm}
        data-testid="wfc-start-button"
        disabled={!hasTiles || isLoading}
      >
        Run WFC
      </button>
      <button
        onClick={runWFCAlgorithmWithBacktracking}
        data-testid="run-wfc-backtracking-button"
        disabled={!hasTiles || isLoading}
      >
        Run WFC with Backtracking
      </button>
      <button
        onClick={resetGrid}
        data-testid="reset-button"
        disabled={!hasTiles || isLoading}
      >
        Reset
      </button>
      {!hasTiles && (
        <div className="wfc-warning">
          Please add tiles to use the WFC algorithm
        </div>
      )}
    </div>
  );
}

export default WFC;
