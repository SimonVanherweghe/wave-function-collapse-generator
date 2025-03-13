import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WFC from '../components/WFC';

// A helper: Create a dummy tile that includes edge details and (optionally) rotation/mirroring options.
// For simplicity, we assume a tile is represented by an object with a grid property.
const createDummyTile = (value) => ({
  grid: [
    [value, value, value],
    [value, value, value],
    [value, value, value],
  ],
  // You could add rotationEnabled/mirrorEnabled attributes if needed:
  rotationEnabled: false,
  mirrorEnabled: false
});

describe('WFC Integration with Updated Tiles', () => {
  it('receives updated tile list and initializes grid accordingly', async () => {
    // Start with an initial tile set of 3 tiles.
    const initialTiles = [createDummyTile(1), createDummyTile(2), createDummyTile(1)];
    render(<WFC tiles={initialTiles} />);
    
    // The possibility set should match the length of initialTiles (i.e. 3).
    const cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    cells.forEach(cell => {
      // Each cell should display "3" (the initial number of tile possibilities).
      expect(cell.textContent).toBe('3');
    });
  });
  
  it('produces a coherent pattern when the algorithm runs', async () => {
    // For a coherent pattern, all available tiles should be compatible.
    // Use tiles that all have identical edge data (e.g. all edges equal 1).
    const compatibleTiles = [createDummyTile(1), createDummyTile(1)];
    render(<WFC tiles={compatibleTiles} />);
    
    // Click the Run WFC button.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait for the algorithm to complete fully collapsing the grid.
    await waitFor(() => {
      const cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // Every cell should be collapsed (possibility count === 1) 
      // and display the selected tile index.
      cells.forEach(cell => {
        expect(cell.textContent).not.toBe('2');  // It should not show the initial count.
        // Instead, each cell shows a single digit, which must be one of the available tile indices.
        expect(['0', '1']).toContain(cell.textContent);
      });
    });
  });
  
  it('updates when new tiles are added even after initial run', async () => {
    // Render the WFC component with an initial set.
    const initialTiles = [createDummyTile(1), createDummyTile(2)];
    const { rerender } = render(<WFC tiles={initialTiles} />);
    
    // Initially, every cell should show "2" (two possibilities).
    let cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    cells.forEach(cell => {
      expect(cell.textContent).toBe('2');
    });
    
    // Now simulate a tile update: add a new tile.
    const updatedTiles = [createDummyTile(1), createDummyTile(2), createDummyTile(1)];
    rerender(<WFC tiles={updatedTiles} />);
    
    // Wait for the grid to reinitialize.
    await waitFor(() => {
      cells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      cells.forEach(cell => {
        // Now each cell should show "3" (three possibilities)
        expect(cell.textContent).toBe('3');
      });
    });
  });
});
