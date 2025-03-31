import React, { useMemo } from "react";
import TilePreview from "./TilePreview";
import { rotateTile, mirrorTile } from "../wfcUtils";
import "./TileVariants.css";

function TileVariants({ tiles }) {
  // Process tiles to include all variants
  const processedTilesByOriginal = useMemo(() => {
    return tiles.map((tile, originalIndex) => {
      const variants = [];

      // Add the original tile
      variants.push({
        grid: tile.grid,
        type: "original",
        description: "Original",
      });

      // Add rotated variants if enabled
      if (tile.rotationEnabled) {
        for (let i = 1; i < 4; i++) {
          const rotated = rotateTile(tile, i);
          // Check if this rotation creates a unique variant
          if (
            !variants.some(
              (v) => JSON.stringify(v.grid) === JSON.stringify(rotated.grid)
            )
          ) {
            variants.push({
              grid: rotated.grid,
              type: "rotation",
              description: `Rotated ${i * 90}°`,
            });
          }
        }
      }

      // Add mirrored variant if enabled
      if (tile.mirrorEnabled) {
        const mirrored = mirrorTile(tile);
        // Check if mirroring creates a unique variant
        if (
          !variants.some(
            (v) => JSON.stringify(v.grid) === JSON.stringify(mirrored.grid)
          )
        ) {
          variants.push({
            grid: mirrored.grid,
            type: "mirror",
            description: "Mirrored",
          });
        }

        // Add rotated mirrors if both rotation and mirror are enabled
        if (tile.rotationEnabled) {
          for (let i = 1; i < 4; i++) {
            const rotatedMirror = rotateTile(
              { ...tile, grid: mirrored.grid },
              i
            );
            // Check if this rotation of the mirror creates a unique variant
            if (
              !variants.some(
                (v) =>
                  JSON.stringify(v.grid) === JSON.stringify(rotatedMirror.grid)
              )
            ) {
              variants.push({
                grid: rotatedMirror.grid,
                type: "rotation-mirror",
                description: `Mirrored + Rotated ${i * 90}°`,
              });
            }
          }
        }
      }

      return {
        originalIndex,
        originalTile: tile,
        variants,
      };
    });
  }, [tiles]);

  // Count total variants
  const totalVariants = processedTilesByOriginal.reduce(
    (sum, item) => sum + item.variants.length,
    0
  );

  return (
    <div className="tile-variants-container">
      <h2>Tile Variants Overview</h2>
      <p className="variants-summary">
        {tiles.length} original tiles generate {totalVariants} total variants
        used in the Wave Function Collapse algorithm.
      </p>

      {processedTilesByOriginal.map((item, index) => (
        <div key={index} className="original-tile-section">
          <h2>Tile {item.originalIndex + 1}</h2>
          <div className="tile-settings">
            <span className="tile-setting">
              Rotation:{" "}
              {item.originalTile.rotationEnabled ? "Enabled" : "Disabled"}
            </span>
            <span className="tile-setting">
              Mirroring:{" "}
              {item.originalTile.mirrorEnabled ? "Enabled" : "Disabled"}
            </span>
            <span className="tile-setting">
              Weight: {item.originalTile.weight || 1}
            </span>
          </div>

          <div className="variants-grid">
            {item.variants.map((variant, variantIndex) => (
              <div
                key={variantIndex}
                className={`variant-item ${variant.type}`}
              >
                <TilePreview tile={{ grid: variant.grid }} />
                <div className="variant-description">{variant.description}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TileVariants;
