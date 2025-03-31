import { useState } from 'react';
import WFC from "./WFC";
import "./GridPage.css";

function GridPage({ tiles }) {
  const [numRows, setNumRows] = useState(20);
  const [numCols, setNumCols] = useState(30);

  const handleRowsChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setNumRows(value);
  };

  const handleColsChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setNumCols(value);
  };

  return (
    <div className="grid-page">
      <div className="grid-controls">
        <div className="control-group">
          <label>
            Rows:
            <input
              type="number"
              value={numRows}
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
              value={numCols}
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
        numRows={numRows}
        numCols={numCols}
        key={JSON.stringify(tiles)}
        showGridlines={false}
      />
    </div>
  );
}

export default GridPage;
