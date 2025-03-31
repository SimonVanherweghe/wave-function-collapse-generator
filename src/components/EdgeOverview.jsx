import { useMemo } from "react";
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
  const size = grid.length;
  let result = JSON.parse(JSON.stringify(grid));
  
  for (let t = 0; t < times; t++) {
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(false));
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        newGrid[j][size - 1 - i] = result[i][j];
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
  // Compute edges directly from tiles with useMemo
  const edges = useMemo(() => {
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
          extractedEdges[edgeKey] = (extractedEdges[edgeKey] || 0) + 1;
        });
      });
    });

    return extractedEdges;
  }, [tiles]);

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
              data-testid="edge-cell"
            />
          ))}
        </div>
        <div className="edge-count">Occurrences: {count}</div>
      </div>
    );
  };

  return (
    <div className="edge-overview">
      <h2>Edge Pattern Overview</h2>
      {Object.keys(edges).length > 0 ? (
        <div className="edges-container">
          {Object.entries(edges).map(([edge, count]) => 
            renderEdge(edge, count)
          )}
        </div>
      ) : (
        <div className="no-edges-message" data-testid="no-edges-message">
          No edge patterns found in current tile set
        </div>
      )}
    </div>
  );
};

export default EdgeOverview;
