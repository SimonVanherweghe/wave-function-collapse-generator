// Given a tile object with a property `grid` (2D array), returns the requested edge
export function getEdge(tile, side) {
  if (!tile || !tile.grid || tile.grid.length === 0) {
    throw new Error("Tile must have a non-empty grid");
  }
  switch (side) {
    case "top":
      return [...tile.grid[0]]; // clone first row
    case "bottom":
      return [...tile.grid[tile.grid.length - 1]]; // clone last row
    case "left":
      return tile.grid.map((row) => row[0]);
    case "right":
      return tile.grid.map((row) => row[row.length - 1]);
    default:
      throw new Error(`Invalid side: ${side}`);
  }
}

//edit test

// Helper function: checks if two arrays are strictly equal element‐by‐element.
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Helper function: logs the current state of the grid for debugging
export function logGridState(grid) {
  /* grid.forEach((row, i) => {
    const rowStr = row
      .map((cell) =>
        cell.possibilities.length === 1
          ? `[${cell.possibilities[0]}]`
          : `(${cell.possibilities.length})`
      )
      .join(" ");
    //console.log(`Row ${i}: ${rowStr}`);
  }); */
}

/*
  edgesAreCompatible accepts either two complete tile objects or two already extracted edge arrays,
  plus a side parameter.
  
  For the purpose of this utility we assume:
  - When matching adjacent tiles, for example:
      • The right edge of the left tile should equal the left edge of the right tile.
      • The bottom edge of the top tile should equal the top edge of the bottom tile.
  - If the caller passes in full tile objects, we extract the respective edges.
  - Otherwise, we expect to get two edge arrays.
  
  The 'side' parameter indicates from which side of the first tile the edge comes.
  For instance:
    - If side is 'right', then tile1's right edge should match tile2's left edge.
    - If side is 'left', then tile1's left edge should match tile2's right edge.
    - etc.
  
  In this simple implementation, compatibility is defined as an exact match of the arrays.
  (In a more advanced version, you might want to allow for rotations or mirror transformations.)
*/
export function edgesAreCompatible(tileOrEdge1, tileOrEdge2, side) {
  let edge1, edge2;

  // If the passed parameter is a tile object (assume it has a grid) then extract the appropriate edge.
  if (tileOrEdge1 && tileOrEdge1.grid) {
    edge1 = getEdge(tileOrEdge1, side);
  } else {
    edge1 = tileOrEdge1; // assume it's already an array
  }

  // Determine the complementary side for the second tile.
  let oppositeSide;
  if (side === "top") {
    oppositeSide = "bottom";
  } else if (side === "bottom") {
    oppositeSide = "top";
  } else if (side === "left") {
    oppositeSide = "right";
  } else if (side === "right") {
    oppositeSide = "left";
  } else {
    throw new Error(`Invalid side parameter: ${side}`);
  }

  if (tileOrEdge2 && tileOrEdge2.grid) {
    edge2 = getEdge(tileOrEdge2, oppositeSide);
  } else {
    edge2 = tileOrEdge2; // assume already an array
  }

  return arraysEqual(edge1, edge2);
}

// Given a grid (2D array of cell objects, where each cell has a 'possibilities' array),
// find the cell with the smallest number of possibilities that is not yet collapsed.
export function findLowestEntropyCell(grid) {
  let minEntropy = Infinity;
  let selected = { row: -1, col: -1 };
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      const count = cell.possibilities.length;
      // Only consider cells that are not yet collapsed
      if (!cell.collapsed && count < minEntropy) {
        minEntropy = count;
        selected = { row: i, col: j };
      }
    });
  });
  return selected;
}

// Given a grid, collapse the cell with the lowest entropy by randomly choosing one possibility.
// Returns a new grid (immutable update) with one cell collapsed.
export function collapseCell(grid, availableTiles) {
  // Find the cell to collapse.
  const { row, col } = findLowestEntropyCell(grid);
  // If no cell is found (or no candidate qualifies), return the grid unchanged.
  if (row === -1 || col === -1) return grid;

  const cell = grid[row][col];
  // Implement weighted random selection based on tile weight.
  const totalWeight = cell.possibilities.reduce(
    (sum, tileIndex) => sum + (availableTiles[tileIndex].weight || 1),
    0
  );
  let r = Math.random() * totalWeight;
  let chosen;
  for (let i = 0; i < cell.possibilities.length; i++) {
    const tileIndex = cell.possibilities[i];
    r -= (availableTiles[tileIndex].weight || 1);
    if (r <= 0) {
      chosen = tileIndex;
      break;
    }
  }
  // Create a new grid with an updated cell.
  const newGrid = grid.map((r, i) =>
    r.map((cellObj, j) =>
      i === row && j === col
        ? { possibilities: [chosen], collapsed: true }
        : cellObj
    )
  );
  return newGrid;
}

/*
  Recursively update neighbors' possibility sets based on the collapsed cell at (row, col).
  It assumes that the cell at (row, col) is collapsed (its possibilities array length is exactly 1).
  availableTiles is the array of available tile definitions.
*/
export function propagateConstraints(grid, row, col, availableTiles) {
  const cell = grid[row][col];
  if (cell.possibilities.length !== 1) return; // should be collapsed

  // Get the collapsed tile information.
  const selectedTileIndex = cell.possibilities[0];
  const collapsedTile = availableTiles[selectedTileIndex];

  if (!collapsedTile) {
    console.error(
      `Tile at index ${selectedTileIndex} not found in availableTiles array`
    );
    return;
  }

  // Define relative directions with the corresponding sides:
  const directions = [
    { dr: -1, dc: 0, sideCollapsed: "top", sideNeighbor: "bottom" },
    { dr: 1, dc: 0, sideCollapsed: "bottom", sideNeighbor: "top" },
    { dr: 0, dc: -1, sideCollapsed: "left", sideNeighbor: "right" },
    { dr: 0, dc: 1, sideCollapsed: "right", sideNeighbor: "left" },
  ];

  directions.forEach((dir) => {
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    // Skip out-of-bound indices.
    if (
      newRow < 0 ||
      newRow >= grid.length ||
      newCol < 0 ||
      newCol >= grid[0].length
    )
      return;

    const neighborCell = grid[newRow][newCol];
    // If neighbor is already collapsed, skip.
    if (neighborCell.possibilities.length === 1) return;

    // Store the current count to check if pruning occurs.
    const oldLength = neighborCell.possibilities.length;

    // Get the edge of the collapsed tile that faces the neighbor
    const collapsedEdge = getEdge(collapsedTile, dir.sideCollapsed);

    // Filter neighbor possibilities by keeping only those candidate indices for which
    // the edge of the collapsed tile on the given side is compatible with the candidate's complementary edge.
    const beforePossibilities = [...neighborCell.possibilities];
    neighborCell.possibilities = neighborCell.possibilities.filter(
      (candidateIndex) => {
        const candidateTile = availableTiles[candidateIndex];
        if (!candidateTile) {
          console.error(
            `Candidate tile at index ${candidateIndex} not found in availableTiles array`
          );
          return false;
        }

        // Use our edgesAreCompatible utility.
        // For a neighbor on the right (for example), we pass side = 'right' so that:
        // collapsedTile's right edge is compared with candidateTile's left edge.
        const isCompatible = edgesAreCompatible(
          collapsedTile,
          candidateTile,
          dir.sideCollapsed
        );

        return isCompatible;
      }
    );


    // If the neighbor's possibilities were pruned, we need to propagate constraints recursively.
    if (neighborCell.possibilities.length < oldLength) {
      propagateConstraints(grid, newRow, newCol, availableTiles);
    }
  });
}
// Rotate a tile's grid clockwise by 90 degrees, repeated 'times' times.
export function rotateTile(tile, times = 1) {
  // Deep clone the tile to avoid mutation.
  let newTile = JSON.parse(JSON.stringify(tile));
  // Normalize times to 0..3
  times = times % 4;
  for (let t = 0; t < times; t++) {
    // Rotate the grid: for a grid M x N, newGrid[j][M - 1 - i] = grid[i][j]
    const oldGrid = newTile.grid;
    const nRows = oldGrid.length;
    const nCols = oldGrid[0].length;
    const rotated = Array.from({ length: nCols }, () =>
      Array(nRows).fill(null)
    );
    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
        rotated[j][nRows - 1 - i] = oldGrid[i][j];
      }
    }
    newTile.grid = rotated;
  }
  return newTile;
}

// Mirror a tile horizontally (flip left/right)
export function mirrorTile(tile) {
  let newTile = JSON.parse(JSON.stringify(tile));
  newTile.grid = newTile.grid.map((row) => row.slice().reverse());
  return newTile;
}
