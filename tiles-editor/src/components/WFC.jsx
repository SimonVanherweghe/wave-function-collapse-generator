import { useState, useEffect, useMemo } from "react";
import TilePreview from "./TilePreview";
import {
  collapseCell,
  propagateConstraints,
  findLowestEntropyCell,
  logGridState
} from "../wfcUtils";

function WFC({ tiles }) {
  // Define grid dimensions
  const numRows = 10;
  const numCols = 10;

  // Always compute possibility set from the current tile list
  const possibilitySet = useMemo(() => tiles.map((_, index) => index), [tiles]);

  // Function to generate a fresh grid
  const generateGrid = () =>
    Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => ({
        possibilities: [...possibilitySet],
        collapsed: false, // Add collapsed flag, initially false
      }))
    );

  // Initialize the grid
  const [grid, setGrid] = useState(generateGrid());

  // If tiles change, reset the grid
  useEffect(() => {
    setGrid(generateGrid());
  }, [possibilitySet]); // possibilitySet changes when tiles change

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
    console.log("Running WFC algorithm...");
    console.log("Available tiles:", tiles.length);

    // Use a local copy of the grid state.
    let currentGrid = grid;
    // Safety counter to avoid infinite loops.
    let iterations = 0;
    const maxIterations = 1000;

    // Log initial grid state
    logGridState(currentGrid);

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
      const newGrid = collapseCell(currentGrid);

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
          tiles
        );
        console.log("After propagation:");
        logGridState(newGrid);
      }
      // Update our current grid for next iteration.
      currentGrid = newGrid;
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
    console.log("Running WFC algorithm with backtracking...");
    console.log("Available tiles:", tiles.length);
    console.log("Initial possibility set:", possibilitySet);

    // Make a local copy of the grid.
    let currentGrid = grid;
    // Stack to remember previous states for backtracking.
    // Each element will be an object: { grid, row, col, triedPossibilities }
    const historyStack = [];
    let iterations = 0;
    const maxIterations = 1000;
    const maxBacktracks = 50;
    let backtracks = 0;

    // Log initial grid state
    logGridState(currentGrid);

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
        console.log(`Backtracked to previous state (backtrack #${backtracks})`);
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
        console.log(`Backtracked to previous state (backtrack #${backtracks})`);
        continue;
      }
      // Choose the first possibility from the remaining ones.
      const chosen = possibleChoices[0];
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
          i === row && j === col ? { possibilities: [chosen] } : cellObj
        )
      );
      // Propagate constraints from the collapsed cell.
      console.log(`Propagating constraints from cell (${row}, ${col})`);
      propagateConstraints(newGrid, row, col, tiles);
      console.log("After propagation:");
      logGridState(newGrid);

      // Update currentGrid.
      currentGrid = newGrid;
    }

    if (iterations >= maxIterations) {
      console.log("Reached maximum iterations without full collapse");
    }

    setGrid(currentGrid);
    console.log("WFC algorithm with backtracking completed");
  };

  // Add a reset function to reinitialize the grid
  const resetGrid = () => {
    setGrid(
      Array.from({ length: numRows }, () =>
        Array.from({ length: numCols }, () => ({
          possibilities: [...possibilitySet],
        }))
      )
    );
  };

  // Handler to collapse a single cell
  const handleCollapseCell = () => {
    const newGrid = collapseCell(grid);
    setGrid(newGrid);
  };

  return (
    <div className="wfc-container">
      <div className="wfc-grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-testid={`wfc-cell-${rowIndex}-${colIndex}`}
                className={`wfc-cell ${cell.collapsed ? 'wfc-cell-collapsed' : 'wfc-cell-uncollapsed'}`}
              >
                {cell.collapsed
                  ? <TilePreview tile={tiles[cell.possibilities[0]]} />
                  : cell.possibilities.length}
              </div>
            );
          })
        )}
      </div>
      <button onClick={runWFCAlgorithm} data-testid="run-wfc-button">
        Run WFC
      </button>
      <button
        onClick={runWFCAlgorithmWithBacktracking}
        data-testid="run-wfc-backtracking-button"
      >
        Run WFC with Backtracking
      </button>
      <button onClick={handleCollapseCell} data-testid="collapse-cell-button">
        Collapse Cell
      </button>
      <button onClick={resetGrid} data-testid="reset-button">
        Reset
      </button>
    </div>
  );
}

export default WFC;
