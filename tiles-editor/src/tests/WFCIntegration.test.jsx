import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WFC from '../components/WFC';

// A helper function: create a dummy tile definition with a known grid.
// For clarity, our dummy tile grid will have uniform edge values.
const createDummyTile = (value) => ({
  grid: [
    [value, value, value],
    [value, value, value],
    [value, value, value],
  ]
});

describe('WFC Full Run', () => {
  it('collapses the entire grid successfully', async () => {
    // Create a dummy availableTiles array.
    // For a successful run, provide at least one tile that is compatible with itself.
    const availableTiles = [
      createDummyTile(1),
      createDummyTile(1)  // All tiles have edges "1"
    ];
    // Render the WFC component with these available tiles.
    // It uses the tiles prop for possibility set initialization.
    render(<WFC tiles={availableTiles} />);
    
    // Click the Run WFC button.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait for state update. Look for every cell to be collapsed (showing the tile index)
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // Check that all cells display a tile index (either "0" or "1")
      cells.forEach(cell => {
        expect(["0", "1"]).toContain(cell.textContent);
      });
    });
  });

  it('collapses grid with incompatible tiles by forcing consistency', async () => {
    // In this test, we provide two tiles that are incompatible with each other.
    // With the current implementation, the algorithm will still collapse the grid
    // by forcing consistency (favoring one tile over the other).
    const tileA = createDummyTile(1);
    const tileB = createDummyTile(2);
    const availableTiles = [tileA, tileB];
    
    // Render the WFC component.
    render(<WFC tiles={availableTiles} />);
    
    // Click Run WFC button.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait for the algorithm to finish.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // We expect all cells to be collapsed to either "0" or "1" (tile indices)
      cells.forEach(cell => {
        expect(["0", "1"]).toContain(cell.textContent);
      });
    });
  });
});
