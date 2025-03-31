import { useCallback } from "react";
import Tile from "./Tile";
import WFC from "./WFC";
import "./HomePage.css";
import { Trash2, Pencil } from "lucide-react";
import { Link } from "react-router";

function HomePage({
  tiles,
  tileSize,
  handleAddTile,
  handleTileUpdate,
  setTileSize,
  handleRemoveTile,
}) {
  // TileWrapper component to properly handle hooks
  function TileWrapper({ tile, index, handleTileUpdate }) {
    // Now we are inside a component, so we can safely use hooks.
    const onUpdateTile = useCallback(
      (updatedTile) => {
        handleTileUpdate(index, updatedTile);
      },
      [handleTileUpdate, index]
    );

    return (
      <div className="tile-wrapper">
        <h3>Tile {index + 1}</h3>
        <Tile tile={tile} tileId={index} onUpdate={onUpdateTile} />
        <div className="controls-wrapper">
          <button
            onClick={() => handleRemoveTile(index)}
            className="remove-tile-button"
            data-testid={`remove-tile-${index}`}
          >
            <Trash2 className="icon" />
            Remove
          </button>
          <Link
            className="edit-tile-button"
            to={`/tile-edit/${index}`}
            data-testid={`edit-tile-${index}`}
          >
            <Pencil className="icon" />
            Edit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container app-container--main">
      <div data-testid="tile-overview" className="left-section">
        <h2>Tile Overview</h2>
        <div className="tile-size-controls">
          <label>
            Tile Size:
            <input
              type="number"
              value={tileSize}
              min="1"
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setTileSize(val);
                localStorage.setItem("tileSize", val);
              }}
              data-testid="tile-size-input"
            />
          </label>
          <button onClick={handleAddTile} className="add-tile-button">
            Add Tile
          </button>
        </div>
        <div className="tiles-container">
          {tiles.map((tile, index) => (
            <TileWrapper
              key={index}
              tile={tile}
              index={index}
              handleTileUpdate={handleTileUpdate}
            />
          ))}
        </div>

        <div data-testid="tile-state" style={{ display: "none" }}>
          {JSON.stringify(tiles)}
        </div>
      </div>
      <div data-testid="wfc-section" className="right-section">
        <h2>Wave Function Collapse</h2>
        <WFC tiles={tiles} key={JSON.stringify(tiles)} />
      </div>
    </div>
  );
}

export default HomePage;
