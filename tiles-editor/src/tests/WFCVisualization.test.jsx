import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WFC from '../components/WFC';

// helper: create dummy tiles array (dummy availableTiles) 
// In our visualization, tile index is simply an number.
const dummyTiles = [{}, {}, {}, {}]; // for example, 4 available tiles

describe('WFC Visualization and Reset', () => {
  it('updates UI as cells become collapsed', async () => {
    render(<WFC tiles={dummyTiles} />);
    
    // Initially, every cell should show possibility count equal to number of dummyTiles (i.e., 4).
    let cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    cells.forEach(cell => {
      expect(cell.textContent).toBe('4');
    });
    
    // Click the "Collapse Cell" button to collapse one cell.
    const collapseButton = screen.getByTestId('collapse-cell-button');
    fireEvent.click(collapseButton);
    
    // Wait for the grid update.
    await waitFor(() => {
      const updatedCells = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // There should be at least one cell now showing a collapsed value 
      // (i.e. its text content is not "4" but a number corresponding to one of the tile indices).
      const collapsedCells = updatedCells.filter(cell => cell.textContent !== '4');
      expect(collapsedCells.length).toBeGreaterThan(0);
    });
  });
  
  it('resets the grid to its initial state after clicking Reset', async () => {
    render(<WFC tiles={dummyTiles} />);
    
    // Collapse some cells by running the algorithm.
    const runButton = screen.getByTestId('run-wfc-button');
    fireEvent.click(runButton);
    
    // Wait briefly for some cells to collapse.
    await waitFor(() => {
      const cellsAfterRun = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // Expect at least one cell to be collapsed (i.e. its text content not equal to initial dummyTiles.length of "4")
      const collapsedCells = cellsAfterRun.filter(cell => cell.textContent !== '4');
      expect(collapsedCells.length).toBeGreaterThan(0);
    });

    // Click the Reset button.
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    
    // Wait for the grid to reinitialize.
    await waitFor(() => {
      const cellsAfterReset = screen.getAllByTestId((content, element) =>
        element.getAttribute('data-testid')?.startsWith('wfc-cell-')
      );
      // Now, every cell should display the initial possibility count, "4".
      cellsAfterReset.forEach(cell => {
        expect(cell.textContent).toBe('4');
      });
    });
  });
});
