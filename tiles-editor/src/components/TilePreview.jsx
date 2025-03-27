import React from "react";
import "./TilePreview.css"; // Create this CSS file for styling

function TilePreview({ tile }) {
  // Renders a miniature version of the tile.
  // You can adapt the rendering to your tile data. Here we assume tile.grid exists.
  return (
    <div className="tile-preview" style={{ "--tile-cols": tile.grid[0].length }}>
      {tile.grid.map((row, i) => (
        <div key={i} className="tile-preview-row">
          {row.map((cell, j) => (
            <div
              key={j}
              className={`tile-preview-cell ${cell ? "active" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default TilePreview;
