import { useState, useEffect, useCallback } from "react";
import Tile from "./components/Tile";
import EdgeOverview from "./components/EdgeOverview";
import WFC from "./components/WFC";
import "./App.css";

function App() {
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

  // Create two different default tiles for better WFC results
  const defaultTileFalse = {
    grid: Array(5)
      .fill(null)
      .map(() => Array(5).fill(false)),
    rotationEnabled: false,
    mirrorEnabled: false,
  };

  const [tiles, setTiles] = useState(() => {
    // Load from localStorage if available
    const savedTiles = localStorage.getItem("tiles");
    return savedTiles ? JSON.parse(savedTiles) : [defaultTileFalse];
  });

  // Save tiles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tiles", JSON.stringify(tiles));
  }, [tiles]);

  // Update a specific tile
  const handleTileUpdate = useCallback((index, updatedTile) => {
    setTiles((prevTiles) => {
      const newTiles = [...prevTiles];
      newTiles[index] = updatedTile;
      return newTiles;
    });
  }, []);

  // Add a new tile
  const handleAddTile = () => {
    setTiles([...tiles, JSON.parse(JSON.stringify(defaultTileFalse))]);
  };

  // Remove a specific tile
  const handleRemoveTile = (index) => {
    setTiles(tiles.filter((tile, i) => i !== index));
  };

  return (
    <div className="app-container">
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
        <button onClick={handleAddTile} className="add-tile-button">
          Add Tile
        </button>
        <div data-testid="tile-state" style={{ display: "none" }}>
          {JSON.stringify(tiles)}
        </div>
      </div>
      <div data-testid="edge-overview" className="right-section">
        <h2>Edge Overview</h2>
        <EdgeOverview tiles={tiles} />

        <h2>Wave Function Collapse</h2>
        <WFC tiles={tiles} />
      </div>
    </div>
  );
}

export default App;
