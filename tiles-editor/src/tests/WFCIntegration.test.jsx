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
    
    // Wait for state update. Look for every cell to be collapsed (possibility count === 1)
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // Check that all cells display a single possibility (either "0" or "1")
      cells.forEach(cell => {
        expect(["0", "1"]).toContain(cell.textContent);
      });
    });
  });

  it('handles a contradiction gracefully by aborting the algorithm', async () => {
    // In this test, simulate a scenario where availableTiles lead to a contradiction:
    // For instance, if availableTiles contain two incompatible tiles.
    const tileA = createDummyTile(1);
    const tileB = createDummyTile(2);
    const availableTiles = [tileA, tileB];
    
    // Render the WFC component.
    render(<WFC tiles={availableTiles} />);
    
    // Click Run WFC button.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait a bit and then check that at least one cell has an empty possibility
    // or that not all cells are collapsed.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // We expect at least one cell to have possibility count not equal to 1, indicating a contradiction.
      const nonCollapsed = cells.filter(cell => cell.textContent !== '1');
      expect(nonCollapsed.length).toBeGreaterThan(0);
    });
  });
});
