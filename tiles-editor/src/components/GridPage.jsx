import WFC from "./WFC";
import "./GridPage.css";

function GridPage({ tiles, gridSize, setGridSize }) {
  const handleRowsChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setGridSize(prev => ({ ...prev, rows: value }));
  };

  const handleColsChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setGridSize(prev => ({ ...prev, cols: value }));
  };

  return (
    <div className="grid-page">
      <div className="grid-controls">
        <div className="control-group">
          <label>
            Rows:
            <input
              type="number"
              value={gridSize.rows}
              onChange={handleRowsChange}
              min="1"
              className="grid-input"
              data-testid="rows-input"
            />
          </label>
          <label>
            Columns:
            <input
              type="number"
              value={gridSize.cols}
              onChange={handleColsChange}
              min="1"
              className="grid-input"
              data-testid="cols-input"
            />
          </label>
        </div>
      </div>
      
      <h2>Large Grid WFC</h2>
      <WFC
        tiles={tiles}
        numRows={gridSize.rows}
        numCols={gridSize.cols}
        key={`wfc-${gridSize.rows}-${gridSize.cols}-${JSON.stringify(tiles)}`}
        showGridlines={false}
      />
    </div>
  );
}

export default GridPage;
