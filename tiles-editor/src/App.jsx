import { useState, useEffect } from 'react';
import Tile from './components/Tile';
import EdgeOverview from './components/EdgeOverview';
import './App.css';

function App() {
  const defaultTile = {
    grid: Array(5).fill(null).map(() => Array(5).fill(false)),
    rotationEnabled: false,
    mirrorEnabled: false,
  };
  
  const [tiles, setTiles] = useState(() => {
    // Load from localStorage if available
    const savedTiles = localStorage.getItem('tiles');
    return savedTiles ? JSON.parse(savedTiles) : [defaultTile];
  });

  // Save tiles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tiles', JSON.stringify(tiles));
  }, [tiles]);

  // Update a specific tile
  const handleTileUpdate = (index, updatedTile) => {
    const newTiles = [...tiles];
    newTiles[index] = updatedTile;
    setTiles(newTiles);
  };

  // Add a new tile
  const handleAddTile = () => {
    setTiles([...tiles, JSON.parse(JSON.stringify(defaultTile))]);
  };

  return (
    <div className="app-container">
      <div data-testid="tile-overview" className="left-section">
        <h2>Tile Overview</h2>
        <div className="tiles-container">
          {tiles.map((tile, index) => (
            <div key={index} className="tile-wrapper">
              <h3>Tile {index + 1}</h3>
              <Tile 
                tile={tile}
                tileId={index}
                onUpdate={(updatedTile) => handleTileUpdate(index, updatedTile)}
              />
            </div>
          ))}
        </div>
        <button onClick={handleAddTile} className="add-tile-button">
          Add Tile
        </button>
        <div data-testid="tile-state" style={{ display: 'none' }}>
          {JSON.stringify(tiles)}
        </div>
      </div>
      <div data-testid="edge-overview" className="right-section">
        <h2>Edge Overview</h2>
        <EdgeOverview tiles={tiles} />
      </div>
    </div>
  );
}

export default App;
