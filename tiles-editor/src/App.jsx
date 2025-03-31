import { useState, useEffect, useCallback } from "react";
import { Routes, Route, NavLink } from "react-router";
import HomePage from "./components/HomePage";
import GridPage from "./components/GridPage";
import TileVariants from "./components/TileVariants";
import EdgeOverview from "./components/EdgeOverview";
import "./App.css";

function App() {
  const [tileSize, setTileSize] = useState(() => {
    const saved = localStorage.getItem("tileSize");
    return saved ? parseInt(saved) : 5;
  });

  // Add grid size state with localStorage persistence
  const [gridSize, setGridSize] = useState(() => {
    const saved = localStorage.getItem("gridSize");
    return saved ? JSON.parse(saved) : { rows: 20, cols: 30 };
  });

  // Save grid size to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("gridSize", JSON.stringify(gridSize));
  }, [gridSize]);

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
        <Route 
          path="/grid" 
          element={
            <GridPage 
              tiles={tiles} 
              gridSize={gridSize} 
              setGridSize={setGridSize} 
            />
          } 
        />
        <Route path="/tile-variants" element={<TileVariants tiles={tiles} />} />
        <Route path="/edge-overview" element={<EdgeOverview tiles={tiles} />} />
      </Routes>
    </>
  );
}

export default App;
