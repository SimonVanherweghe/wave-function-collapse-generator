import './App.css'

function App() {
  return (
    <div className="app-container">
      <div data-testid="tile-overview" className="left-section">
        {/* Tile overview area */}
        <h2>Tile Overview</h2>
      </div>
      <div data-testid="edge-overview" className="right-section">
        {/* Edge overview area */}
        <h2>Edge Overview</h2>
      </div>
    </div>
  )
}

export default App
