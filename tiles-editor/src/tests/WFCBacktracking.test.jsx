import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WFC from '../components/WFC';

// A helper: create a dummy tile definition with a grid.
// For our test, we simulate tiles with numerical edge values.
const createDummyTile = (value) => ({
  grid: [
    [value, value, value],
    [value, value, value],
    [value, value, value],
  ],
  rotationEnabled: false,
  mirrorEnabled: false
});

describe('WFC Backtracking Algorithm', () => {
  it('resolves a contradiction via backtracking', async () => {
    // Set up a tile set that could lead to a contradiction.
    // For instance, provide two tiles that are incompatible.
    // We'll use tileA (edges=1) and tileB (edges=2). Normally, if collapsed incorrectly,
    // a cell might be forced to choose an impossible possibility.
    const tileA = createDummyTile(1);
    const tileB = createDummyTile(2);
    const availableTiles = [tileA, tileB];
    
    // Render the WFC component with these available tiles.
    render(<WFC tiles={availableTiles} />);
    
    // Click the Run WFC button to trigger the algorithm with backtracking.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait until the grid is either fully collapsed or the algorithm aborts.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // In this contradiction scenario, our simple backtracking will try to force a collapse.
      // Verify that no cell remains with an empty possibility set.
      cells.forEach(cell => {
        // Every cell must display either a "0" or "1" since we have two tiles.
        // (It is acceptable if all cells collapse to one possibility if backtracking resolved it.)
        expect(["0", "1"]).toContain(cell.textContent);
      });
    });
  });

  it('fully collapses the grid with backtracking enabled even in challenging scenarios', async () => {
    // Use a tile set of three tiles (simulate variant possibilities)
    const tileA = createDummyTile(1);
    const tileB = createDummyTile(2);
    const tileC = createDummyTile(1); // compatible with tileA
    const availableTiles = [tileA, tileB, tileC];
    
    // Render the WFC component with these available tiles.
    render(<WFC tiles={availableTiles} />);
    
    // Run the algorithm.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait until the grid is fully collapsed.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      cells.forEach(cell => {
        // Each cell should be collapsed to a single possibility ("0", "1", or "2")
        expect(cell.textContent.length).toBe(1);
      });
    });
  });
});
