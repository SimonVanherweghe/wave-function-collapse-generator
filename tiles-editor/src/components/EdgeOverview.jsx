import { useState, useMemo } from "react";
import "./EdgeOverview.css";

// Helper functions moved outside component to prevent recreation on each render
const extractEdges = (grid) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const top = grid[0].map(cell => cell ? 1 : 0);
  const right = grid.map(row => row[cols - 1] ? 1 : 0);
  const bottom = grid[rows - 1].map(cell => cell ? 1 : 0).reverse();
  const left = grid.map(row => row[0] ? 1 : 0).reverse();
  return [top, right, bottom, left];
};

// Rotate a tile grid by 90 degrees * times
const rotateTile = (grid, times) => {
  let result = JSON.parse(JSON.stringify(grid));
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  for (let t = 0; t < times; t++) {
    const newGrid = Array(cols).fill(null).map(() => Array(rows).fill(false));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        newGrid[j][rows - 1 - i] = result[i][j];
      }
    }
    result = newGrid;
  }
  return result;
};

// Mirror a tile grid horizontally
const mirrorTile = (grid) => {
  return grid.map(row => row.slice().reverse());
};

// Get all variations of a tile based on rotation and mirroring
const getTileVariations = (tile) => {
  const variations = [{ grid: tile.grid }];

  if (tile.rotationEnabled) {
    // Add rotated variations
    for (let i = 1; i < 4; i++) {
      variations.push({
        grid: rotateTile(tile.grid, i),
      });
    }
  }

  if (tile.mirrorEnabled) {
    // Add mirrored variations
    const currentVariations = [...variations];
    currentVariations.forEach((variation) => {
      variations.push({
        grid: mirrorTile(variation.grid),
      });
    });
  }

  return variations;
};

const EdgeOverview = ({ tiles }) => {
  const [autoUpdate, setAutoUpdate] = useState(true);

  // Compute edges from tiles whenever tiles change
  const autoComputedEdges = useMemo(() => {
    const extractedEdges = {};

    tiles.forEach((tile) => {
      // Get all possible variations of the tile based on rotation and mirroring
      const variations = getTileVariations(tile);

      // Extract edges from each variation
      variations.forEach((variation) => {
        const tileEdges = extractEdges(variation.grid);

        // Add edges to the collection
        tileEdges.forEach((edge) => {
          const edgeKey = edge.join("");
          if (extractedEdges[edgeKey]) {
            extractedEdges[edgeKey]++;
          } else {
            extractedEdges[edgeKey] = 1;
          }
        });
      });
    });

    return extractedEdges;
  }, [tiles]);

  // Store manual edges when autoUpdate is off
  const [manualEdges, setManualEdges] = useState(autoComputedEdges);

  // When in manual mode, choose which edges to render
  const edgesToRender = autoUpdate ? autoComputedEdges : manualEdges;

  // Render edge visualization
  const renderEdge = (edge, count) => {
    const edgeArray = edge.split("").map(Number);

    return (
      <div key={edge} className="edge-item">
        <div className="edge-visualization">
          {edgeArray.map((cell, index) => (
            <div
              key={index}
              className={`edge-cell ${
                cell ? "edge-cell-black" : "edge-cell-white"
              }`}
            />
          ))}
        </div>
        <div className="edge-count">Count: {count}</div>
      </div>
    );
  };

  // Handle toggle of auto-update mode
  const handleAutoUpdateToggle = (e) => {
    setAutoUpdate(e.target.checked);
  };

  // Handle manual refresh button click
  const handleRefresh = () => {
    setManualEdges(autoComputedEdges);
  };

  return (
    <div className="edge-overview">
      <div className="edge-controls" style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="checkbox"
            checked={autoUpdate}
            onChange={handleAutoUpdateToggle}
            data-testid="auto-update-checkbox"
          />
          Auto-update
        </label>
        {!autoUpdate && (
          <button
            onClick={handleRefresh}
            className="refresh-button"
            data-testid="refresh-button"
          >
            Refresh
          </button>
        )}
      </div>
      <h3>Unique Edges</h3>
      <div className="edges-container">
        {Object.entries(edgesToRender).map(([edge, count]) =>
          renderEdge(edge, count)
        )}
      </div>
    </div>
  );
};

export default EdgeOverview;
