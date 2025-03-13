import { render, screen } from '@testing-library/react';
import WFC from '../components/WFC';
import { describe, it, expect } from 'vitest';

describe('WFC Component', () => {
  it('renders correctly and initializes a 10x10 grid', () => {
    // Provide a dummy empty tiles list to satisfy the prop.
    render(<WFC tiles={[]} />);
    
    // Check that the "Run WFC" button is rendered.
    expect(screen.getByTestId('run-wfc-button')).toBeInTheDocument();
    
    // Check that the grid has 100 cells in total.
    const cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    expect(cells.length).toBe(100);
  });

  it('initializes every grid cell with the full set of tile possibilities', () => {
    // Create a dummy tiles array with 5 items with rotation/mirror disabled
    const dummyTiles = Array(5).fill(null).map(() => ({
      grid: [[false]],
      rotationEnabled: false,
      mirrorEnabled: false
    }));
    
    render(<WFC tiles={dummyTiles} />);
    
    // Expect grid dimensions: 10 x 10 cells
    const cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    
    // Check that there are 100 cells.
    expect(cells.length).toBe(100);
    
    // For each cell, expect its inner text (possibility count) to equal dummyTiles.length (i.e., 5).
    cells.forEach(cell => {
      expect(cell.textContent).toBe('5');
    });
  });

  it('displays possibility count for uncollapsed cells even with single possibility', () => {
    // Create a dummy tiles array with just 1 item with rotation/mirror disabled
    const dummyTiles = [ { 
      grid: [[false, false], [false, false]],
      rotationEnabled: false,
      mirrorEnabled: false
    } ];
    
    render(<WFC tiles={dummyTiles} />);
    
    const cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    
    // Even though each cell has only one possibility [0],
    // they should display "1" (the count) because they're not collapsed
    cells.forEach(cell => {
      expect(cell.textContent).toBe('1');
      // Verify the cell is not marked as collapsed
      expect(cell).toHaveClass('wfc-cell-uncollapsed');
      expect(cell).not.toHaveClass('wfc-cell-collapsed');
    });
  });
});
