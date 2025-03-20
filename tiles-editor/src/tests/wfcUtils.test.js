import { describe, it, expect } from 'vitest';
import { getEdge, edgesAreCompatible, findLowestEntropyCell, collapseCell, propagateConstraints, rotateTile, mirrorTile } from '../wfcUtils';

describe('wfcUtils - getEdge', () => {
  const sampleTile = {
    grid: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
  };

  it('returns the top edge', () => {
    const topEdge = getEdge(sampleTile, 'top');
    expect(topEdge).toEqual([1, 2, 3]);
  });

  it('returns the bottom edge', () => {
    const bottomEdge = getEdge(sampleTile, 'bottom');
    expect(bottomEdge).toEqual([7, 8, 9]);
  });

  it('returns the left edge', () => {
    const leftEdge = getEdge(sampleTile, 'left');
    expect(leftEdge).toEqual([1, 4, 7]);
  });

  it('returns the right edge', () => {
    const rightEdge = getEdge(sampleTile, 'right');
    expect(rightEdge).toEqual([3, 6, 9]);
  });
});

describe('Tile Processing for Rotation/Mirroring', () => {
  it('includes rotated variants when rotationEnabled is true', () => {
    const tile = {
      grid: [
        [true, false],
        [false, true]
      ],
      rotationEnabled: true,
      mirrorEnabled: false,
    };
    
    // Process the tile using the same logic used in WFC.jsx:
    const processed = [];
    // Always add original tile.
    processed.push(tile);
    // Add rotated variants.
    for (let i = 1; i < 4; i++) {
      const rotated = rotateTile(tile, i);
      processed.push(rotated);
    }
    
    // Remove duplicates.
    const unique = processed.filter((t, idx) =>
      processed.findIndex((x) => JSON.stringify(x.grid) === JSON.stringify(t.grid)) === idx
    );
    
    // Expect at least 2 variants (if not all rotations are unique)
    expect(unique.length).toBeGreaterThan(1);
  });
  
  it('includes mirrored variants when mirrorEnabled is true', () => {
    const tile = {
      grid: [
        [true, false],
        [false, false]
      ],
      rotationEnabled: false,
      mirrorEnabled: true,
    };
    
    // Process the tile using the same logic used in WFC.jsx:
    const processed = [];
    // Always add original tile.
    processed.push(tile);
    // Add mirrored variant.
    const mirrored = mirrorTile(tile);
    processed.push(mirrored);
    
    // Remove duplicates.
    const unique = processed.filter((t, idx) =>
      processed.findIndex((x) => JSON.stringify(x.grid) === JSON.stringify(t.grid)) === idx
    );
    
    // Expect 2 variants (original + mirrored)
    expect(unique.length).toBe(2);
  });
});

describe('wfcUtils - edgesAreCompatible', () => {
  const tileA = {
    grid: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
  };

  const tileB = {
    grid: [
      [3, 10, 20],
      [6, 11, 21],
      [9, 12, 22],
    ]
  };

  it('returns true for two compatible edges (tileA right vs tileB left)', () => {
    const compatible = edgesAreCompatible(tileA, tileB, 'right');
    expect(compatible).toBe(true);
  });

  it('returns false for two incompatible edges', () => {
    const tileB_modified = {
      grid: [
        [0, 10, 20],
        [0, 11, 21],
        [0, 12, 22],
      ]
    };
    const compatible = edgesAreCompatible(tileA, tileB_modified, 'right');
    expect(compatible).toBe(false);
  });

  it('works when passing in already extracted edge arrays', () => {
    const edgeA = [3, 6, 9];
    const edgeB = [3, 6, 9];
    const compatible = edgesAreCompatible(edgeA, edgeB, 'right');
    expect(compatible).toBe(true);
  });
});

describe('WFC Collapse Logic', () => {
  it('identifies the cell with the lowest entropy', () => {
    const grid = [
      [ { possibilities: [0, 1, 2], collapsed: false }, { possibilities: [0], collapsed: true } ],
      [ { possibilities: [0, 1], collapsed: false }, { possibilities: [0], collapsed: true } ],
    ];
    const cellIndex = findLowestEntropyCell(grid);
    expect(cellIndex).toEqual({ row: 1, col: 0 });
  });

  it('collapses the chosen cell to exactly one possibility and marks it as collapsed', () => {
    const availableTiles = [
      { weight: 1 }, { weight: 1 }, { weight: 1 }
    ];
    const grid = [
      [ { possibilities: [0, 1, 2], collapsed: false }, { possibilities: [0], collapsed: true } ],
      [ { possibilities: [0, 1], collapsed: false }, { possibilities: [0], collapsed: true } ],
    ];
    const newGrid = collapseCell(grid, availableTiles);
    const collapsedCell = newGrid[1][0];
    expect(collapsedCell.possibilities.length).toBe(1);
    expect([0, 1]).toContain(collapsedCell.possibilities[0]);
    expect(collapsedCell.collapsed).toBe(true);
  });

  it('does not collapse cells that are already collapsed', () => {
    const availableTiles = [
      { weight: 1 }, { weight: 1 }, { weight: 1 }
    ];
    const grid = [
      [ { possibilities: [0], collapsed: true }, { possibilities: [1], collapsed: true } ],
      [ { possibilities: [2], collapsed: true }, { possibilities: [3], collapsed: true } ],
    ];
    const newGrid = collapseCell(grid, availableTiles);
    expect(newGrid).toEqual(grid);
  });

  it('selects tiles according to weight probabilities', () => {
    const iterations = 10000;
    const counts = { 0: 0, 1: 0 };
    const availableTiles = [{ weight: 5 }, { weight: 1 }];
    for (let i = 0; i < iterations; i++) {
      // Create a 1x1 grid with both possibilities.
      const grid = [[{ possibilities: [0, 1], collapsed: false }]];
      const newGrid = collapseCell(grid, availableTiles);
      const chosen = newGrid[0][0].possibilities[0];
      counts[chosen]++;
    }
    // Expect tile 0 (weight 5) to be chosen significantly more often than tile 1.
    // For example, tile 0's count should be roughly 5 times tile 1's count.
    expect(counts[0]).toBeGreaterThan(counts[1] * 4);
  });
});

describe('Constraint Propagation', () => {
  const createTile = (value) => ({
    grid: [
      [value === 1, value === 1, value === 1],
      [value === 1, value === 1, value === 1],
      [value === 1, value === 1, value === 1],
    ],
    rotationEnabled: false,
    mirrorEnabled: false
  });

  const tileA = createTile(1);
  const tileB = createTile(2);
  const tileC = createTile(1);
  const availableTiles = [tileA, tileB, tileC];

  it('prunes neighboring cells based on edge compatibility', () => {
    const grid = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => ({ possibilities: [0, 1, 2] }))
    );
    grid[1][1] = { possibilities: [0], collapsed: true };
    expect(grid[1][0].possibilities.length).toBe(3);
    expect(grid[0][1].possibilities.length).toBe(3);
    propagateConstraints(grid, 1, 1, availableTiles);
    const expectedPruned = [0, 2];
    expect(grid[1][0].possibilities).toEqual(expectedPruned);
    expect(grid[0][1].possibilities).toEqual(expectedPruned);
    expect(grid[1][2].possibilities).toEqual(expectedPruned);
    expect(grid[2][1].possibilities).toEqual(expectedPruned);
  });

  it('recursively propagates changes', () => {
    const grid = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => ({ possibilities: [0, 1, 2] }))
    );
    grid[0][0] = { possibilities: [1], collapsed: true };
    propagateConstraints(grid, 0, 0, availableTiles);
    expect(grid[0][1].possibilities).toEqual([1]);
    expect(grid[1][0].possibilities).toEqual([1]);
    expect(grid[1][1].possibilities).toEqual([1]);
  });
});
