import { useState } from "react";
import "./Tile.css";

function Tile({ tile, tileId, onUpdate }) {
  const [grid, setGrid] = useState(tile.grid);
  const [rotationEnabled, setRotationEnabled] = useState(tile.rotationEnabled);
  const [mirrorEnabled, setMirrorEnabled] = useState(tile.mirrorEnabled);
  const [weight, setWeight] = useState(tile.weight !== undefined ? tile.weight : 1);

  const handleCellClick = (row, col) => {
    const newGrid = grid.map((r, i) =>
      i === row ? r.map((cell, j) => (j === col ? !cell : cell)) : r
    );
    setGrid(newGrid);
    if (onUpdate) {
      onUpdate({ grid: newGrid, rotationEnabled, mirrorEnabled });
    }
  };

  const handleRotationChange = (e) => {
    const newRotation = e.target.checked;
    setRotationEnabled(newRotation);
    if (onUpdate) {
      onUpdate({ grid, rotationEnabled: newRotation, mirrorEnabled, weight });
    }
  };

  const handleMirrorChange = (e) => {
    const newMirror = e.target.checked;
    setMirrorEnabled(newMirror);
    if (onUpdate) {
      onUpdate({ grid, rotationEnabled, mirrorEnabled: newMirror, weight });
    }
  };

  const handleWeightChange = (e) => {
    const newWeight = Number(e.target.value);
    setWeight(newWeight);
    if (onUpdate) {
      onUpdate({ grid, rotationEnabled, mirrorEnabled, weight: newWeight });
    }
  };

  return (
    <div className="tile-component">
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                data-testid={`tile-${tileId}-cell-${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`grid-cell ${cell ? "active" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="options" style={{ marginTop: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={rotationEnabled}
            onChange={handleRotationChange}
            data-testid="rotation-checkbox"
          />
          Rotation
        </label>
        <label>
          <input
            type="checkbox"
            checked={mirrorEnabled}
            onChange={handleMirrorChange}
            data-testid="mirror-checkbox"
          />
          Mirror
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Weight:
          <input
            type="number"
            value={weight}
            onChange={handleWeightChange}
            data-testid="weight-input"
            min="0"
            style={{ width: "4rem", marginLeft: "0.5rem" }}
          />
        </label>
      </div>
    </div>
  );
}

export default Tile;
