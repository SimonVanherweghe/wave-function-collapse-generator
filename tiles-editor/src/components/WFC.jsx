import { useState } from 'react';

function WFC({ tiles }) {
  // Define grid dimensions
  const numRows = 10;
  const numCols = 10;
  
  // Initialize the grid (each cell starts as null)
  const [grid, setGrid] = useState(
    Array.from({ length: numRows }, () => Array(numCols).fill(null))
  );
  
  // Handler for the Run WFC button (logic to be added later)
  const runWFC = () => {
    // Placeholder: later this will trigger the algorithm.
    console.log('Running WFC algorithm');
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
              style={{ width: '30px', height: '30px', border: '1px solid #ccc' }}
            >
              {cell}
            </div>
          ))
        )}
      </div>
      <button onClick={runWFC} data-testid="run-wfc-button">
        Run WFC
      </button>
    </div>
  );
}

export default WFC;
