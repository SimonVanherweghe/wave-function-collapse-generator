import { useState, useEffect, useMemo } from 'react';
import { collapseCell, propagateConstraints, findLowestEntropyCell } from '../wfcUtils';

function WFC({ tiles }) {
  // Define grid dimensions
  const numRows = 10;
  const numCols = 10;
  
  // Always compute possibility set from the current tile list
  const possibilitySet = useMemo(() => tiles.map((_, index) => index), [tiles]);
  
  // Function to generate a fresh grid
  const generateGrid = () => (
    Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => ({ possibilities: [...possibilitySet] }))
    )
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
        const len = grid[i][j].possibilities.length;
        if (len === 0) {
          contradiction = true;
          break;
        }
        if (len > 1) {
          allCollapsed = false;
        }
      }
      if (contradiction) break;
    }
    return { allCollapsed, contradiction };
  };

  // Original WFC algorithm without backtracking
  const runWFCAlgorithm = () => {
    // Use a local copy of the grid state.
    let currentGrid = grid;
    // Safety counter to avoid infinite loops.
    let iterations = 0;
    const maxIterations = 1000;
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
      // Collapse one cell: use collapseCell which returns a new grid
      const newGrid = collapseCell(currentGrid);
      
      // Find which cell was collapsed.
      let collapsedCell = null;
      for (let i = 0; i < currentGrid.length; i++) {
        for (let j = 0; j < currentGrid[0].length; j++) {
          if (currentGrid[i][j].possibilities.length > 1 &&
              newGrid[i][j].possibilities.length === 1) {
            collapsedCell = { row: i, col: j };
            break;
          }
        }
        if (collapsedCell) break;
      }
      // Propagate constraints from the collapsed cell.
      if (collapsedCell) {
        propagateConstraints(newGrid, collapsedCell.row, collapsedCell.col, tiles);
      }
      // Update our current grid for next iteration.
      currentGrid = newGrid;
    }
    // Finally, update component state
    setGrid(currentGrid);
  };

  // New backtracking version of the algorithm
  const runWFCAlgorithmWithBacktracking = () => {
    // Make a local copy of the grid.
    let currentGrid = grid;
    // Stack to remember previous states for backtracking.
    // Each element will be an object: { grid, row, col, triedPossibilities }
    const historyStack = [];
    let iterations = 0;
    const maxIterations = 1000;
    const maxBacktracks = 50;
    let backtracks = 0;

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
      if (row === -1) break; // nothing to collapse

      const cell = currentGrid[row][col];
      // If the cell is ambiguous (possibilities.length > 1), try a possibility.
      // Try the first possibility that has not been tried for this cell.
      let triedPossibilities = [];
      // See if we already have a record for this cell in history.
      const existingRecord = historyStack.find((rec) => rec.row === row && rec.col === col);
      if (existingRecord) {
        triedPossibilities = existingRecord.triedPossibilities;
      }
      // Find a possibility not yet tried.
      const possibleChoices = cell.possibilities.filter(p => !triedPossibilities.includes(p));
      if (possibleChoices.length === 0) {
        // Nothing left to try in this cell: contradiction; backtrack.
        if (historyStack.length === 0 || backtracks >= maxBacktracks) {
          console.error("No possibilities remain for cell - backtracking aborted");
          break;
        }
        const prev = historyStack.pop();
        currentGrid = prev.grid;
        backtracks++;
        continue;
      }
      // Choose the first possibility from the remaining ones.
      const chosen = possibleChoices[0];
      // Save current state along with the fact that we are trying this possibility.
      historyStack.push({
        grid: JSON.parse(JSON.stringify(currentGrid)), // Deep clone the grid
        row,
        col,
        triedPossibilities: [...triedPossibilities, chosen]
      });
      // Collapse the cell by forcing its possibilities to only the chosen.
      const newGrid = currentGrid.map((r, i) =>
        r.map((cellObj, j) =>
          i === row && j === col ? { possibilities: [chosen] } : cellObj
        )
      );
      // Propagate constraints from the collapsed cell.
      propagateConstraints(newGrid, row, col, tiles);
      // Update currentGrid.
      currentGrid = newGrid;
    }
    setGrid(currentGrid);
  };

  // Add a reset function to reinitialize the grid
  const resetGrid = () => {
    setGrid(
      Array.from({ length: numRows }, () =>
        Array.from({ length: numCols }, () => ({
          possibilities: [...possibilitySet]
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
      <div className="wfc-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 30px)`, gap: '2px' }}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isCollapsed = cell.possibilities.length === 1;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-testid={`wfc-cell-${rowIndex}-${colIndex}`}
                className="wfc-cell"
                style={{
                  width: '30px',
                  height: '30px',
                  border: '1px solid #ccc',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: isCollapsed ? '#8BC34A' : 'transparent', // collapsed cells get a green background
                  fontWeight: isCollapsed ? 'bold' : 'normal'
                }}
              >
                {isCollapsed ? cell.possibilities[0] : cell.possibilities.length}
              </div>
            );
          })
        )}
      </div>
      <button onClick={runWFCAlgorithmWithBacktracking} data-testid="run-wfc-button">
        Run WFC
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
