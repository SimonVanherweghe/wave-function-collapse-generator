import { useState } from 'react';
import { collapseCell, propagateConstraints, findLowestEntropyCell } from '../wfcUtils';

function WFC({ tiles }) {
  // Define grid dimensions
  const numRows = 10;
  const numCols = 10;
  
  // Compute possibility set from available tiles (using their indexes)
  const possibilitySet = tiles.map((_, index) => index);

  // Initialize the grid (each cell contains its possibilities)
  const [grid, setGrid] = useState(
    Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => ({ possibilities: [...possibilitySet] }))
    )
  );
  
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

  // Handler for the Run WFC button
  const runWFC = () => {
    // Placeholder: later this will trigger the algorithm.
    console.log('Running WFC algorithm');
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
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              data-testid={`wfc-cell-${rowIndex}-${colIndex}`}
              className="wfc-cell"
              style={{ width: '30px', height: '30px', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {cell.possibilities.length}
            </div>
          ))
        )}
      </div>
      <button onClick={runWFCAlgorithm} data-testid="run-wfc-button">
        Run WFC
      </button>
      <button onClick={handleCollapseCell} data-testid="collapse-cell-button">
        Collapse Cell
      </button>
    </div>
  );
}

export default WFC;
