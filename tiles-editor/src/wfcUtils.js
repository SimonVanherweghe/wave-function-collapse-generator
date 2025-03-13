
// Given a tile object with a property `grid` (2D array), returns the requested edge
export function getEdge(tile, side) {
  if (!tile || !tile.grid || tile.grid.length === 0) {
    throw new Error("Tile must have a non-empty grid");
  }
  switch (side) {
    case 'top':
      return [...tile.grid[0]]; // clone first row
    case 'bottom':
      return [...tile.grid[tile.grid.length - 1]]; // clone last row
    case 'left':
      return tile.grid.map(row => row[0]);
    case 'right':
      return tile.grid.map(row => row[row.length - 1]);
    default:
      throw new Error(`Invalid side: ${side}`);
  }
}

// Helper function: checks if two arrays are strictly equal element‐by‐element.
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
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
  if (side === 'top') {
    oppositeSide = 'bottom';
  } else if (side === 'bottom') {
    oppositeSide = 'top';
  } else if (side === 'left') {
    oppositeSide = 'right';
  } else if (side === 'right') {
    oppositeSide = 'left';
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
// find the cell with the smallest number of possibilities greater than 1.
export function findLowestEntropyCell(grid) {
  let minEntropy = Infinity;
  let selected = { row: -1, col: -1 };
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      const count = cell.possibilities.length;
      // Only consider cells that are not yet collapsed (i.e. possibilities length > 1)
      if (count > 1 && count < minEntropy) {
        minEntropy = count;
        selected = { row: i, col: j };
      }
    });
  });
  return selected;
}

// Given a grid, collapse the cell with the lowest entropy by randomly choosing one possibility.
// Returns a new grid (immutable update) with one cell collapsed.
export function collapseCell(grid) {
  // Find the cell to collapse.
  const { row, col } = findLowestEntropyCell(grid);
  // If no cell is found (or no candidate qualifies), return the grid unchanged.
  if (row === -1 || col === -1) return grid;
  
  const cell = grid[row][col];
  // Randomly pick one possibility.
  const randomIndex = Math.floor(Math.random() * cell.possibilities.length);
  const chosen = cell.possibilities[randomIndex];
  
  // Create a new grid with an updated cell.
  const newGrid = grid.map((r, i) =>
    r.map((cellObj, j) =>
      i === row && j === col
        ? { possibilities: [chosen] } // collapse this cell
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

  // Define relative directions with the corresponding sides:
  const directions = [
    { dr: -1, dc: 0, sideCollapsed: 'top', sideNeighbor: 'bottom' },
    { dr: 1,  dc: 0, sideCollapsed: 'bottom', sideNeighbor: 'top' },
    { dr: 0,  dc: -1, sideCollapsed: 'left', sideNeighbor: 'right' },
    { dr: 0,  dc: 1, sideCollapsed: 'right', sideNeighbor: 'left' }
  ];

  directions.forEach(dir => {
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    // Skip out-of-bound indices.
    if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) return;

    const neighborCell = grid[newRow][newCol];
    // If neighbor is already collapsed, skip.
    if (neighborCell.possibilities.length === 1) return;

    // Store the current count to check if pruning occurs.
    const oldLength = neighborCell.possibilities.length;

    // Filter neighbor possibilities by keeping only those candidate indices for which
    // the edge of the collapsed tile on the given side is compatible with the candidate's complementary edge.
    neighborCell.possibilities = neighborCell.possibilities.filter(candidateIndex => {
      const candidateTile = availableTiles[candidateIndex];
      // Use our edgesAreCompatible utility.
      // For a neighbor on the right (for example), we pass side = 'right' so that:
      // collapsedTile's right edge is compared with candidateTile's left edge.
      return edgesAreCompatible(collapsedTile, candidateTile, dir.sideCollapsed);
    });

    // If the neighbor's possibilities were pruned, we need to propagate constraints recursively.
    if (neighborCell.possibilities.length < oldLength) {
      propagateConstraints(grid, newRow, newCol, availableTiles);
    }
  });
}
