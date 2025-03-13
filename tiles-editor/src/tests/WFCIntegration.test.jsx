import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WFC from '../components/WFC';

// Helper function: create a dummy tile definition that uses a 3x3 grid.
const createDummyTile = (value) => ({
  grid: [
    [value === 1, value === 1, value === 1],
    [value === 1, value === 1, value === 1],
    [value === 1, value === 1, value === 1],
  ],
  rotationEnabled: false,
  mirrorEnabled: false
});

describe('WFC Integration', () => {
  it('initializes the grid correctly with the given tile set', async () => {
    // Test the grid initialization behavior.
    const initialTiles = [createDummyTile(1), createDummyTile(2), createDummyTile(1)];
    render(<WFC tiles={initialTiles} />);
    
    // Expect each grid cell to display possibility count equal to processedTiles.length.
    // Since rotation and mirror are disabled, processedTiles length equals initialTiles.length (3).
    const cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    expect(cells.length).toBe(100);
    cells.forEach(cell => {
      expect(cell.textContent).toBe('3');
      expect(cell).toHaveClass('wfc-cell-uncollapsed');
    });
  });

  it('collapses the entire grid successfully and displays tile previews in collapsed cells', async () => {
    // For a successful run, use two compatible tiles.
    const availableTiles = [createDummyTile(1), createDummyTile(1)];
    render(<WFC tiles={availableTiles} />);
    
    // Click the Run WFC button.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait until the algorithm completes.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // Check that every cell is collapsed (using the collapsed CSS class)
      // and that each cell contains a TilePreview element.
      cells.forEach(cell => {
        expect(cell).toHaveClass('wfc-cell-collapsed');
        expect(cell.querySelector('.tile-preview')).not.toBeNull();
      });
    });
  });

  it('collapses grid with incompatible tiles by forcing consistency (backtracking if needed)', async () => {
    // Provide two tiles that are incompatible.
    const tileA = createDummyTile(1);
    const tileB = createDummyTile(2);
    const availableTiles = [tileA, tileB];
    render(<WFC tiles={availableTiles} />);
    
    // Use the backtracking algorithm if available.
    // Assume we have a "runWFC-backtracking-button" when backtracking is enabled.
    const runBacktrackingButton = screen.getByTestId('run-wfc-backtracking-button');
    fireEvent.click(runBacktrackingButton);
    
    // Wait for the algorithm to finish.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      cells.forEach(cell => {
        // Each cell should be collapsed and display a tile preview.
        expect(cell).toHaveClass('wfc-cell-collapsed');
        expect(cell.querySelector('.tile-preview')).not.toBeNull();
      });
    });
  });

  it('updates when new tiles are added even after initial run', async () => {
    // Render the component with an initial tile set
    const initialTiles = [createDummyTile(1), createDummyTile(2)];
    const { rerender } = render(<WFC tiles={initialTiles} />);
    
    // Initially, each cell shows a possibility count of 2.
    let cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    cells.forEach(cell => {
      expect(cell.textContent).toBe('2');
    });
    
    // Update tile set by adding one more tile.
    const updatedTiles = [createDummyTile(1), createDummyTile(2), createDummyTile(1)];
    rerender(<WFC tiles={updatedTiles} />);
    
    // Wait for grid to reinitialize (cells should show possibility count of 3).
    await waitFor(() => {
      cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      cells.forEach(cell => {
        expect(cell.textContent).toBe('3');
      });
    });
  });

  it('renders fallback TilePreview if a tile is removed after algorithm run', async () => {
    // Start with a dummy tile set with two tiles.
    const availableTiles = [createDummyTile(1), createDummyTile(1)];
    const { rerender } = render(<WFC tiles={availableTiles} />);
    
    // Run the algorithm.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait for some cells to collapse.
    await waitFor(() => {
      const collapsedCells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      ).filter(cell => cell.classList.contains('wfc-cell-collapsed'));
      expect(collapsedCells.length).toBeGreaterThan(0);
    });
    
    // Remove one tile from the set and re-render.
    const updatedTiles = [ availableTiles[1] ];
    rerender(<WFC tiles={updatedTiles} />);
    
    // Wait for the grid update.
    await waitFor(() => {
      const collapsedCells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      ).filter(cell => cell.classList.contains('wfc-cell-collapsed'));
      // Check that at least one collapsed cell now uses the fallback display (i.e. doesn't have a TilePreview).
      const fallbackCells = collapsedCells.filter(cell => cell.querySelector('.tile-preview-fallback') !== null);
      expect(fallbackCells.length).toBeGreaterThan(0);
    });
  });
});
