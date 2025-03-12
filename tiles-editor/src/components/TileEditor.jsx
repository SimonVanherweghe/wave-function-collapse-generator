import { useState, useEffect } from 'react';
import p5 from 'p5';

const TileEditor = ({ tile, onUpdate, index }) => {
  const [p5Instance, setP5Instance] = useState(null);
  const cellSize = 30;
  const gridSize = 5;
  const canvasSize = cellSize * gridSize;

  useEffect(() => {
    // Create a new p5 instance
    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(canvasSize, canvasSize);
        p.noLoop();
      };

      p.draw = () => {
        p.background(240);
        
        // Draw grid
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            p.stroke(0);
            p.strokeWeight(1);
            p.fill(tile.grid[i][j] ? 0 : 255);
            p.rect(j * cellSize, i * cellSize, cellSize, cellSize);
          }
        }
      };

      p.mouseClicked = () => {
        if (p.mouseX >= 0 && p.mouseX < canvasSize && p.mouseY >= 0 && p.mouseY < canvasSize) {
          const i = Math.floor(p.mouseY / cellSize);
          const j = Math.floor(p.mouseX / cellSize);
          
          // Create a deep copy of the grid
          const newGrid = JSON.parse(JSON.stringify(tile.grid));
          newGrid[i][j] = !newGrid[i][j];
          
          // Update the tile
          onUpdate(index, { ...tile, grid: newGrid });
          
          // Redraw the canvas
          p.redraw();
        }
      };
    };

    // Create and store the p5 instance
    const instance = new p5(sketch, document.getElementById(`tile-canvas-${index}`));
    setP5Instance(instance);

    // Cleanup function
    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, [tile, onUpdate, index]);

  // Redraw when tile changes
  useEffect(() => {
    if (p5Instance) {
      p5Instance.redraw();
    }
  }, [tile, p5Instance]);

  const handleRotationToggle = () => {
    onUpdate(index, { ...tile, rotationEnabled: !tile.rotationEnabled });
  };

  const handleMirrorToggle = () => {
    onUpdate(index, { ...tile, mirrorEnabled: !tile.mirrorEnabled });
  };

  return (
    <div className="tile-editor">
      <div id={`tile-canvas-${index}`}></div>
      <div className="tile-controls">
        <label>
          <input
            type="checkbox"
            checked={tile.rotationEnabled}
            onChange={handleRotationToggle}
          />
          Rotation
        </label>
        <label>
          <input
            type="checkbox"
            checked={tile.mirrorEnabled}
            onChange={handleMirrorToggle}
          />
          Mirror
        </label>
      </div>
    </div>
  );
};

export default TileEditor;
