import { useState, useEffect, useCallback } from "react";
import { Routes, Route, NavLink } from "react-router";
import HomePage from "./pages/HomePage/HomePage";
import GridPage from "./pages/GridPage/GridPage";
import TileVariantsPage from "./pages/TileVariantsPage/TileVariantsPage";
import EdgeOverviewPage from "./pages/EdgeOverviewPage/EdgeOverviewPage";
import "./App.css";

function App() {
  const [tileSize, setTileSize] = useState(() => {
    const saved = localStorage.getItem("tileSize");
    return saved ? parseInt(saved) : 5;
  });

  // Update all tile grids when tile size changes
  useEffect(() => {
    setTiles((prevTiles) =>
      prevTiles.map((tile) => {
        const oldGrid = tile.grid;
        return {
          ...tile,
          grid: Array.from({ length: tileSize }, (_, i) =>
            Array.from({ length: tileSize }, (_, j) =>
              // For cells that exist in the old grid preserve their value; otherwise, default to false.
              oldGrid[i] && oldGrid[i][j] !== undefined ? oldGrid[i][j] : false
            )
          ),
        };
      })
    );
  }, [tileSize]);


  // Create two different default tiles for better WFC results
  const defaultTileFalse = {
    grid: Array(tileSize)
      .fill(null)
      .map(() => Array(tileSize).fill(false)),
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
    setTiles([
      ...tiles,
      {
        grid: Array(tileSize)
          .fill(null)
          .map(() => Array(tileSize).fill(false)),
        rotationEnabled: false,
        mirrorEnabled: false,
        weight: 1,
      },
    ]);
  };

  // Remove a specific tile
  const handleRemoveTile = (index) => {
    setTiles(tiles.filter((tile, i) => i !== index));
  };

  return (
    <>
      <nav className="app-nav">
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/grid">Grid</NavLink>
          </li>
          <li>
            <NavLink to="/tile-variants">Tile Variants</NavLink>
          </li>
          <li>
            <NavLink to="/edge-overview">Edge Patterns</NavLink>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              tiles={tiles}
              tileSize={tileSize}
              handleAddTile={handleAddTile}
              handleRemoveTile={handleRemoveTile}
              handleTileUpdate={handleTileUpdate}
              setTileSize={setTileSize}
            />
          }
        />
        <Route path="/grid" element={<GridPage tiles={tiles} />} />
        <Route path="/tile-variants" element={<TileVariantsPage tiles={tiles} />} />
        <Route path="/edge-overview" element={<EdgeOverviewPage tiles={tiles} />} />
      </Routes>
    </>
  );
}

export default App;
