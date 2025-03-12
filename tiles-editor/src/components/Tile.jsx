import { useState, useEffect } from 'react';

function Tile({ tile, onUpdate }) {
  const [grid, setGrid] = useState(tile.grid);
  const [rotationEnabled, setRotationEnabled] = useState(tile.rotationEnabled);
  const [mirrorEnabled, setMirrorEnabled] = useState(tile.mirrorEnabled);

  // Whenever any state changes, notify the parent via onUpdate callback
  useEffect(() => {
    if (onUpdate) {
      onUpdate({ grid, rotationEnabled, mirrorEnabled });
    }
  }, [grid, rotationEnabled, mirrorEnabled]);

  const handleCellClick = (row, col) => {
    setGrid((prevGrid) => {
      // Create a deep copy of the grid
      const newGrid = prevGrid.map((r) => r.slice());
      newGrid[row][col] = !newGrid[row][col];
      return newGrid;
    });
  };

  const handleRotationChange = (e) => {
    setRotationEnabled(e.target.checked);
  };

  const handleMirrorChange = (e) => {
    setMirrorEnabled(e.target.checked);
  };

  return (
    <div className="tile-component">
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row" style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                data-testid={`cell-${rowIndex}-${colIndex}`}
                className="grid-cell"
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`grid-cell ${cell ? 'active' : ''}`}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '1px solid black',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="options" style={{ marginTop: '1rem' }}>
        <label>
          <input 
            type="checkbox" 
            checked={rotationEnabled} 
            onChange={handleRotationChange}
            data-testid="rotation-checkbox"
          />
          Rotation
        </label>
        <label style={{ marginLeft: '1rem' }}>
          <input 
            type="checkbox" 
            checked={mirrorEnabled} 
            onChange={handleMirrorChange}
            data-testid="mirror-checkbox"
          />
          Mirror
        </label>
      </div>
    </div>
  );
}

export default Tile;
