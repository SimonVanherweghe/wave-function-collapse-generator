import { describe, it, expect } from 'vitest';
import { getEdge, edgesAreCompatible, findLowestEntropyCell, collapseCell } from '../wfcUtils';

describe('wfcUtils - getEdge', () => {
  const sampleTile = {
    // A simple 3x3 grid example, values can be any type; here using numbers for clarity.
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

describe('wfcUtils - edgesAreCompatible', () => {
  // Create two tiles with compatible edges by design.
  // Let tileA have a right edge [3, 6, 9] and tileB have a left edge [3, 6, 9].
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
    // Modify tileB so its left edge is different.
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
    // Extract edges manually
    const edgeA = [3, 6, 9];
    const edgeB = [3, 6, 9];
    // Compatibility check when "side" is ignored because edges are directly passed
    // Since our implementation for edgesAreCompatible expects a side param,
    // it will treat edgeB as if it were from the complementary side.
    const compatible = edgesAreCompatible(edgeA, edgeB, 'right');
    expect(compatible).toBe(true);
  });

  // Additional test for rotation/mirroring can be added once that logic is implemented.
  // For now, since our utility does a straightforward check, we keep the test simple.
});

describe('WFC Collapse Logic', () => {
  it('identifies the cell with the lowest entropy', () => {
    // Define a 2x2 grid manually:
    // Top-left: possibilities length = 3
    // Top-right: possibilities length = 1 (already collapsed)
    // Bottom-left: possibilities length = 2 (lowest entropy among non-collapsed)
    // Bottom-right: possibilities length = 1 (collapsed)
    const grid = [
      [ { possibilities: [0, 1, 2] }, { possibilities: [0] } ],
      [ { possibilities: [0, 1] }, { possibilities: [0] } ],
    ];
    const cellIndex = findLowestEntropyCell(grid);
    expect(cellIndex).toEqual({ row: 1, col: 0 });
  });

  it('collapses the chosen cell to exactly one possibility', () => {
    // Use the same grid as before.
    const grid = [
      [ { possibilities: [0, 1, 2] }, { possibilities: [0] } ],
      [ { possibilities: [0, 1] }, { possibilities: [0] } ],
    ];
    const newGrid = collapseCell(grid);
    // The candidate cell (1,0) should be collapsed.
    const collapsedCell = newGrid[1][0];
    expect(collapsedCell.possibilities.length).toBe(1);
    // The chosen value should come from the original possibilities.
    expect([0, 1]).toContain(collapsedCell.possibilities[0]);
  });

  it('does not collapse cells that are already collapsed', () => {
    const grid = [
      [ { possibilities: [0] }, { possibilities: [1] } ],
      [ { possibilities: [2] }, { possibilities: [3] } ],
    ];
    // Since every cell is already collapsed (possibilities length === 1), the function should leave the grid unchanged.
    const newGrid = collapseCell(grid);
    expect(newGrid).toEqual(grid);
  });
});
