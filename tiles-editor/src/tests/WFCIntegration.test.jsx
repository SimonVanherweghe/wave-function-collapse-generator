import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WFC from '../components/WFC';

// Helper function: Create a dummy tile definition that uses a 3x3 grid.
// For clarity, we use a boolean grid. When value is 1 the entire grid will be true.
const createDummyTile = (value) => ({
  grid: [
    [value === 1, value === 1, value === 1],
    [value === 1, value === 1, value === 1],
    [value === 1, value === 1, value === 1],
  ],
  rotationEnabled: false,
  mirrorEnabled: false
});

describe('WFC Full Run', () => {
  it('collapses the entire grid successfully and displays a tile preview in collapsed cells', async () => {
    // Create a dummy availableTiles array.
    // For a successful run, we use two compatible tiles (both with grid all true).
    const availableTiles = [
      createDummyTile(1),
      createDummyTile(1)
    ];
    render(<WFC tiles={availableTiles} />);
    
    // Find and click the "Run WFC" button.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait until all cells are collapsed.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // Check that every cell is marked as collapsed and contains a TilePreview (.tile-preview element).
      cells.forEach(cell => {
        expect(cell).toHaveClass('wfc-cell-collapsed');
        expect(cell.querySelector('.tile-preview')).not.toBeNull();
      });
    });
  });

  it('collapses grid with incompatible tiles by forcing consistency (backtracking if needed)', async () => {
    // In this test, we provide two tiles that are incompatible.
    // With our current algorithm, it forces consistency by favoring one tile over the other.
    const tileA = createDummyTile(1);
    const tileB = createDummyTile(2);
    const availableTiles = [tileA, tileB];
    render(<WFC tiles={availableTiles} />);
    
    // Run the algorithm with backtracking.
    const runButton = screen.getByTestId('run-wfc-backtracking-button');
    fireEvent.click(runButton);
    
    // Wait for the algorithm to finish.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // All cells should be collapsed and contain a TilePreview.
      cells.forEach(cell => {
        expect(cell).toHaveClass('wfc-cell-collapsed');
        expect(cell.querySelector('.tile-preview')).not.toBeNull();
      });
    });
  });
});
