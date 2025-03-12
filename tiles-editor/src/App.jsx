import { useState } from 'react'
import './App.css'

function App() {
  const defaultTile = {
    grid: Array(5).fill(null).map(() => Array(5).fill(false)),
    rotationEnabled: false,
    mirrorEnabled: false,
  };
  const [tiles, setTiles] = useState([defaultTile]);
  return (
    <div className="app-container">
      <div data-testid="tile-overview" className="left-section">
        {/* Tile overview area */}
        <h2>Tile Overview</h2>
        <div data-testid="tile-state" style={{ display: 'none' }}>
          {JSON.stringify(tiles)}
        </div>
      </div>
      <div data-testid="edge-overview" className="right-section">
        {/* Edge overview area */}
        <h2>Edge Overview</h2>
      </div>
    </div>
  )
}

export default App
