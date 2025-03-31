import { useCallback } from "react";
import Tile from "../../components/Tile";
import WFC from "../../components/WFC";
import "./HomePage.css";

function HomePage({ 
  tiles, 
  tileSize, 
  handleAddTile, 
  handleRemoveTile, 
  handleTileUpdate, 
  setTileSize 
}) {
  // TileWrapper component to properly handle hooks
  function TileWrapper({ tile, index, handleTileUpdate, handleRemoveTile }) {
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
        <button
          onClick={() => handleRemoveTile(index)}
          className="remove-tile-button"
          data-testid={`remove-tile-${index}`}
        >
          Remove Tile
        </button>
      </div>
    );
  }

  return (
    <div className="app-container app-container--main">
      <div data-testid="tile-overview" className="left-section">
        <h2>Tile Overview</h2>
        <div className="tiles-container">
          {tiles.map((tile, index) => (
            <TileWrapper
              key={index}
              tile={tile}
              index={index}
              handleTileUpdate={handleTileUpdate}
              handleRemoveTile={handleRemoveTile}
            />
          ))}
        </div>
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
        </div>
        <button onClick={handleAddTile} className="add-tile-button">
          Add Tile
        </button>
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
