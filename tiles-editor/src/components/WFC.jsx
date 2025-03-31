import { useState, useRef, useEffect, useMemo } from "react";
import "./WFC.css";
import {
  findLowestEntropyCell,
  gridStatus,
  mirrorTile,
  propagateConstraints,
  rotateTile,
} from "../wfcUtils";
import TilePreview from "./TilePreview";

function WFC({ tiles, numRows = 10, numCols = 10, showGridlines = true }) {
  const canvasRef = useRef(null);
  const [pixelSize] = useState(10);

  // Determine if we have tiles
  const hasTiles = tiles && tiles.length > 0;

  // Process the effective tile list to include rotated and mirrored variants if enabled.
  const processedTiles = useMemo(() => {
    let processed = [];
    tiles.forEach((tile) => {
      // Always include the original tile.
      processed.push(tile);

      // If rotationEnabled, add rotated variants (only add unique ones)
      if (tile.rotationEnabled) {
        for (let i = 1; i < 4; i++) {
          const rotated = rotateTile(tile, i);
          // Check uniqueness by comparing stringified grids.
          if (
            !processed.some(
              (t) => JSON.stringify(t.grid) === JSON.stringify(rotated.grid)
            )
          ) {
            processed.push(rotated);
          }
        }
      }
      // If mirrorEnabled, add the mirrored variant.
      if (tile.mirrorEnabled) {
        const mirrored = mirrorTile(tile);
        if (
          !processed.some(
            (t) => JSON.stringify(t.grid) === JSON.stringify(mirrored.grid)
          )
        ) {
          processed.push(mirrored);
        }
      }
    });
    return processed;
  }, [tiles]);

  // Always compute possibility set from the processed tile list
  const possibilitySet = processedTiles.map((_, index) => index);

  // Function to generate a fresh grid
  const generateGrid = () =>
    Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => ({
        possibilities: [...possibilitySet],
        collapsed: false,
      }))
    );

  // Initialize the grid with memoized initial state
  const [grid, setGrid] = useState(() => generateGrid());
  const [isLoading, setIsLoading] = useState(false);

  // New backtracking version of the algorithm
  const runWFCAlgorithmWithBacktracking = async () => {
    if (!hasTiles) return;

    setIsLoading(true);
    try {
      // Simulate asynchronous work to ensure spinner is visible
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Make a local copy of the grid.
      let currentGrid = generateGrid();
    // Stack to remember previous states for backtracking.
    // Each element will be an object: { grid, row, col, originalPossibilities, tried }
    const historyStack = [];
    let iterations = 0;
    const maxIterations = 1000;
    const maxBacktracks = 50;
    let backtracks = 0;

    try {
      while (iterations < maxIterations) {
        iterations++;
        /* const collapsedCount = currentGrid
          .flat()
          .filter((c) => c.collapsed).length;
        const totalCells = currentGrid.length * currentGrid[0].length;
                console.log(
          `[WFC] Iteration ${iterations}: ${collapsedCount}/${totalCells} collapsed`
        ); */
        const { allCollapsed, contradiction } = gridStatus(currentGrid);
        if (allCollapsed) {
          console.log(`[WFC] ALL collapsed`);
          break; // finished!
        }
        if (contradiction) {
          /*        console.warn(
            `[WFC] Contradiction detected at iteration ${iterations}. Starting backtracking...`
          ); */
          // If contradiction occurs, backtrack if possible.
          if (historyStack.length === 0 || backtracks >= maxBacktracks) {
            console.error("Backtracking exhausted - contradiction unresolved");
            break;
          }
          const record = historyStack.pop();
          const prevGrid = record.grid;
          // Remove the previously tried possibility from the original possibilities.
          const updatedPossibilities = record.originalPossibilities.filter(
            (p) => p !== record.tried
          );
          /*   console.warn(
            `[WFC] Backtracking: at cell (${record.row}, ${record.col}), removing possibility ${record.tried}. Remaining: ${updatedPossibilities}`
          ); */
          // Update the cell in the restored grid with the reduced possibility set and mark it uncollapsed.
          prevGrid[record.row][record.col] = {
            possibilities: updatedPossibilities,
            collapsed: false,
          };
          currentGrid = prevGrid;
          backtracks++;
          /*     console.log(`[WFC] Backtracked ${backtracks} times so far`); */
          continue;
        }
        // Find cell with lowest entropy.
        const { row, col } = findLowestEntropyCell(currentGrid);
        if (row === -1) {
          break; // nothing to collapse
        }

        const cell = currentGrid[row][col];
        /*     console.log(
          `[WFC] Collapsing cell at (${row}, ${col}), with possibilities: ${cell.possibilities}`
        ); */
        // If the cell is ambiguous (possibilities.length > 1), try a possibility.
        // Find a possibility to try
        const possibleChoices = cell.possibilities;
        if (possibleChoices.length === 0) {
          // Nothing left to try in this cell: contradiction; backtrack.
          if (historyStack.length === 0 || backtracks >= maxBacktracks) {
            /*     console.error(
              "No possibilities remain for cell - backtracking aborted"
            ); */
            break;
          }
          const record = historyStack.pop();
          const prevGrid = record.grid;
          // Remove the previously tried possibility from the original possibilities.
          const updatedPossibilities = record.originalPossibilities.filter(
            (p) => p !== record.tried
          );
          // Update the cell in the restored grid with the reduced possibility set and mark it uncollapsed.
          prevGrid[record.row][record.col] = {
            possibilities: updatedPossibilities,
            collapsed: false,
          };
          currentGrid = prevGrid;
          backtracks++;
          continue;
        }
        // Randomly select from the available possibilities
        // Weighted random selection for the backtracking branch.
        let totalWeight = possibleChoices.reduce(
          (sum, tileIndex) => sum + (processedTiles[tileIndex].weight || 1),
          0
        );
        let r = Math.random() * totalWeight;
        let chosen;
        for (let i = 0; i < possibleChoices.length; i++) {
          const tileIndex = possibleChoices[i];
          r -= processedTiles[tileIndex].weight || 1;
          if (r <= 0) {
            chosen = tileIndex;
            break;
          }
        }
        // Save current state along with the fact that we are trying this possibility.
        historyStack.push({
          grid: JSON.parse(JSON.stringify(currentGrid)), // deep clone grid state before collapse
          row,
          col,
          originalPossibilities: [...cell.possibilities],
          tried: chosen,
        });
        /*   console.log(
          `[WFC] Choosing possibility ${chosen} at cell (${row}, ${col})`
        ); */
        // Collapse the cell by forcing its possibilities to only the chosen.
        const newGrid = currentGrid.map((r, i) =>
          r.map((cellObj, j) =>
            i === row && j === col
              ? { possibilities: [chosen], collapsed: true }
              : cellObj
          )
        );
        // Propagate constraints from the collapsed cell.
        propagateConstraints(newGrid, row, col, processedTiles);
        currentGrid = newGrid;
        // Log how many cells are collapsed now.
        /*   const newCollapsedCount = currentGrid
          .flat()
          .filter((c) => c.collapsed).length;
          console.log(
          `[WFC] After collapse at (${row}, ${col}): ${newCollapsedCount}/${totalCells} collapsed`
        ); */
      }
    } catch (error) {
      console.error(
        "Error occurred in runWFCAlgorithmWithBacktracking:",
        error
      );
    }

    console.log(
      `[WFC] Finished after ${iterations} iterations and ${backtracks} backtracks.`
    );
    const finalCollapsedCount = currentGrid
      .flat()
      .filter((c) => c.collapsed).length;
    if (finalCollapsedCount !== currentGrid.length * currentGrid[0].length) {
      console.warn(
        `[WFC] Warning: Only ${finalCollapsedCount}/${
          currentGrid.length * currentGrid[0].length
        } cells collapsed.`
      );
    }
    setGrid(currentGrid);
    } finally {
      setIsLoading(false);
    }
  };

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasTiles) return;

    let ctx;
    try {
      ctx = canvas.getContext("2d");
      if (!ctx) return; // Exit if context is not available (e.g., in test environment)
    } catch (e) {
      console.warn("Canvas context not available:", e);
      return; // Exit gracefully in test environments
    }

    // If we have no tiles yet, just clear the canvas
    if (processedTiles.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Use the first tile to determine dimensions
    const sampleTile = processedTiles[0];
    const tileRows = sampleTile.grid.length;
    const tileCols = sampleTile.grid[0].length;

    // Set canvas dimensions
    canvas.width = numCols * tileCols * pixelSize;
    canvas.height = numRows * tileRows * pixelSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each cell
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell.collapsed && cell.possibilities.length === 1) {
          const tile = processedTiles[cell.possibilities[0]];
          // Draw tile grid
          tile.grid.forEach((tileRow, r) => {
            tileRow.forEach((value, c) => {
              ctx.fillStyle = value ? "#000" : "#fff";
              ctx.fillRect(
                j * tileCols * pixelSize + c * pixelSize,
                i * tileRows * pixelSize + r * pixelSize,
                pixelSize,
                pixelSize
              );
            });
          });
        } else {
          // Draw uncollapsed cell background
          ctx.fillStyle = "#eee";
          ctx.fillRect(
            j * tileCols * pixelSize,
            i * tileRows * pixelSize,
            tileCols * pixelSize,
            tileRows * pixelSize
          );

          // Draw the number of possibilities in the center
          if (cell.possibilities.length > 0) {
            ctx.fillStyle = "#333";
            ctx.font = `${pixelSize * 2}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              cell.possibilities.length.toString(),
              j * tileCols * pixelSize + (tileCols * pixelSize) / 2,
              i * tileRows * pixelSize + (tileRows * pixelSize) / 2
            );
          }
        }

        // Draw gridlines
        if (showGridlines) {
          ctx.strokeStyle = "#ccc";
          ctx.lineWidth = 1;
          ctx.strokeRect(
            j * tileCols * pixelSize,
            i * tileRows * pixelSize,
            tileCols * pixelSize,
            tileRows * pixelSize
          );
        }
      });
    });

    // Draw loading overlay if needed
    if (isLoading) {
      ctx.fillStyle = "rgba(128, 128, 128, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#fff";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2);
    }
  }, [
    grid,
    processedTiles,
    numRows,
    numCols,
    showGridlines,
    pixelSize,
    isLoading,
    hasTiles,
  ]);

  const downloadGridAsImage = () => {
    // Warn and exit if not fully collapsed.
    if (grid.flat().some((cell) => !cell.collapsed)) {
      console.warn("Grid is not fully collapsed yet.");
      return;
    }

    // Use the existing canvas for download
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generate timestamp string YYYY-MM-DD_HH-MM-SS
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now
      .getHours()
      .toString()
      .padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;

    // Trigger the download.
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `WFC-result_${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunWFC = () => {
    runWFCAlgorithmWithBacktracking();
  };

  const handleDownload = () => {
    downloadGridAsImage();
  };

  return (
    <div className="wfc-container" key={JSON.stringify(tiles)}>
      <div className="wfc-canvas-container">
        <canvas
          ref={canvasRef}
          className="wfc-canvas"
          data-testid="wfc-canvas"
        />
      </div>

      <div className="wfc-controls">
        <button
          onClick={handleRunWFC}
          data-testid="run-wfc-button"
          disabled={!hasTiles || isLoading}
        >
          Run WFC
        </button>
        <button
          onClick={handleDownload}
          data-testid="download-image-button"
          disabled={!grid.flat().every((cell) => cell.collapsed) || isLoading}
        >
          Download Image
        </button>
        {!hasTiles && (
          <div className="wfc-warning">
            Please add tiles to use the WFC algorithm
          </div>
        )}
      </div>
    </div>
  );
}

export default WFC;
