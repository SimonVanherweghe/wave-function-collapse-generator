import { useState } from "react";
import {
  collapseCell,
  findLowestEntropyCell,
  logGridState,
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
  const runWFCAlgorithm = () => {
    if (!hasTiles) return; // Prevent running algorithm if no tiles.
    console.log("Running WFC algorithm...");
    console.log("Available tiles:", processedTiles.length);

    // Use a fresh copy of the grid state.
    let currentGrid = generateGrid();

    // Safety counter to avoid infinite loops.
    let iterations = 0;
    const maxIterations = 1000;

    // Log initial grid state
    logGridState(currentGrid);

    try {
      while (iterations < maxIterations) {
        iterations++;
        const { allCollapsed, contradiction } = gridStatus(currentGrid);
        if (contradiction) {
          console.error("Contradiction encountered – aborting algorithm");
          break;
        }
        if (allCollapsed) {
          console.log(
            "All cells collapsed successfully after",
            iterations,
            "iterations"
          );
          break;
        }

        // Find cell with lowest entropy
        const lowestEntropyCell = findLowestEntropyCell(currentGrid);
        if (lowestEntropyCell.row === -1) {
          console.log("No cells to collapse - algorithm complete");
          break;
        }
        console.log(
          `Iteration ${iterations}: Collapsing cell at (${lowestEntropyCell.row}, ${lowestEntropyCell.col})`
        );

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
              console.log(
                `Cell (${i}, ${j}) collapsed to value: ${newGrid[i][j].possibilities[0]}`
              );
              break;
            }
          }
          if (collapsedCell) break;
        }
        // Propagate constraints from the collapsed cell.
        if (collapsedCell) {
          console.log(
            `Propagating constraints from cell (${collapsedCell.row}, ${collapsedCell.col})`
          );
          propagateConstraints(
            newGrid,
            collapsedCell.row,
            collapsedCell.col,
            processedTiles
          );
          console.log("After propagation:");
          logGridState(newGrid);
        }
        // Update our current grid for next iteration.
        currentGrid = newGrid;
      }
    } catch (error) {
      console.error("Error occurred in runWFCAlgorithm:", error);
    }

    if (iterations >= maxIterations) {
      console.log("Reached maximum iterations without full collapse");
    }

    // Finally, update component state
    setGrid(currentGrid);
    console.log("WFC algorithm completed");
  };

  // New backtracking version of the algorithm
  const runWFCAlgorithmWithBacktracking = () => {
    if (!hasTiles) return;
    console.log("Running WFC algorithm with backtracking...");
    console.log("Available tiles:", processedTiles.length);
    console.log("Initial possibility set:", possibilitySet);

    // Make a local copy of the grid.
    let currentGrid = generateGrid();
    // Stack to remember previous states for backtracking.
    // Each element will be an object: { grid, row, col, triedPossibilities }
    const historyStack = [];
    let iterations = 0;
    const maxIterations = 1000;
    const maxBacktracks = 50;
    let backtracks = 0;

    // Log initial grid state
    logGridState(currentGrid);

    try {
      while (iterations < maxIterations) {
        iterations++;
        const { allCollapsed, contradiction } = gridStatus(currentGrid);
        if (allCollapsed) {
          console.log(
            "All cells collapsed successfully after",
            iterations,
            "iterations with",
            backtracks,
            "backtracks"
          );
          break; // finished!
        }
        if (contradiction) {
          // If contradiction occurs, backtrack if possible.
          console.log("Contradiction detected - attempting to backtrack");
          if (historyStack.length === 0 || backtracks >= maxBacktracks) {
            console.error("Backtracking exhausted - contradiction unresolved");
            break;
          }
          const prev = historyStack.pop();
          currentGrid = prev.grid;
          backtracks++;
          console.log(
            `Backtracked to previous state (backtrack #${backtracks})`
          );
          // In a more complete solution, we would remove the previously tried possibility
          // and try a different one in that cell. For simplicity, we assume the history
          // already stored the "failed" collapse so that on backtracking, another collapse will occur.
          continue;
        }
        // Find cell with lowest entropy.
        const { row, col } = findLowestEntropyCell(currentGrid);
        if (row === -1) {
          console.log("No cells to collapse - algorithm complete");
          break; // nothing to collapse
        }

        console.log(
          `Iteration ${iterations}: Processing cell at (${row}, ${col}) with ${currentGrid[row][col].possibilities.length} possibilities`
        );

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
          console.log(
            `Cell (${row}, ${col}) has been tried before with possibilities: ${triedPossibilities.join(
              ", "
            )}`
          );
        }
        // Find a possibility not yet tried.
        const possibleChoices = cell.possibilities.filter(
          (p) => !triedPossibilities.includes(p)
        );
        if (possibleChoices.length === 0) {
          // Nothing left to try in this cell: contradiction; backtrack.
          console.log(
            `No untried possibilities for cell (${row}, ${col}) - need to backtrack`
          );
          if (historyStack.length === 0 || backtracks >= maxBacktracks) {
            console.error(
              "No possibilities remain for cell - backtracking aborted"
            );
            break;
          }
          const prev = historyStack.pop();
          currentGrid = prev.grid;
          backtracks++;
          console.log(
            `Backtracked to previous state (backtrack #${backtracks})`
          );
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
          r -= (processedTiles[tileIndex].weight || 1);
          if (r <= 0) {
            chosen = tileIndex;
            break;
          }
        }
        console.log(`Collapsing cell (${row}, ${col}) to value: ${chosen}`);

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
        console.log(`Propagating constraints from cell (${row}, ${col})`);
        propagateConstraints(newGrid, row, col, processedTiles);
        console.log("After propagation:");
        logGridState(newGrid);

        // Update currentGrid.
        currentGrid = newGrid;
      }
    } catch (error) {
      console.error(
        "Error occurred in runWFCAlgorithmWithBacktracking:",
        error
      );
    }

    if (iterations >= maxIterations) {
      console.log("Reached maximum iterations without full collapse");
    }

    setGrid(currentGrid);
    console.log("WFC algorithm with backtracking completed");
  };

  // Add a reset function to reinitialize the grid
  const resetGrid = () => {
    setGrid(generateGrid());
  };

  return (
    <div className="wfc-container" key={JSON.stringify(tiles)}>
      <div
        className="wfc-grid"
        data-testid="wfc-grid-container"
        style={{ '--grid-cols': numCols, '--grid-rows': numRows }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-testid={`wfc-cell-${rowIndex}-${colIndex}`}
                className={`wfc-cell ${!showGridlines ? 'wfc-cell--no-gridlines' : ''} ${cell.collapsed ? "wfc-cell-collapsed" : "wfc-cell-uncollapsed"}`}
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
      <button
        onClick={runWFCAlgorithm}
        data-testid="run-wfc-button"
        disabled={!hasTiles}
      >
        Run WFC
      </button>
      <button
        onClick={runWFCAlgorithmWithBacktracking}
        data-testid="run-wfc-backtracking-button"
        disabled={!hasTiles}
      >
        Run WFC with Backtracking
      </button>
      <button
        onClick={resetGrid}
        data-testid="reset-button"
        disabled={!hasTiles}
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
