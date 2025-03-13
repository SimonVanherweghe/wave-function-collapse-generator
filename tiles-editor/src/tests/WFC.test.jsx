import { render, screen } from '@testing-library/react';
import WFC from '../components/WFC';
import { describe, it, expect } from 'vitest';

describe('WFC Component', () => {
  it('renders correctly and initializes a 10x10 grid when no tiles are provided', async () => {
    // When no tiles are provided, effectiveTiles is []
    render(<WFC tiles={[]} />);
    
    // Check that the "Run WFC" button is rendered and disabled.
    expect(screen.getByTestId('run-wfc-button')).toBeInTheDocument();
    expect(screen.getByTestId('run-wfc-button')).toBeDisabled();
    expect(screen.getByTestId('run-wfc-backtracking-button')).toBeDisabled();
    expect(screen.getByTestId('reset-button')).toBeDisabled();
    
    // Check that the warning message is displayed.
    expect(screen.getByText('Please add tiles to use the WFC algorithm')).toBeInTheDocument();
    
    // Check that the grid has 100 cells.
    const cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    expect(cells.length).toBe(100);
    
    // Since possibilitySet is empty, each cell shows "0".
    cells.forEach(cell => {
      expect(cell.textContent).toBe('0');
    });
  });

  it('initializes every grid cell with the full set of tile possibilities when tiles are provided', () => {
    // Create a dummy tiles array with 5 items (rotation and mirror disabled).
    // possibilitySet equals [0, 1, 2, 3, 4].
    const dummyTiles = Array(5).fill(null).map(() => ({
      grid: [[false]],
      rotationEnabled: false,
      mirrorEnabled: false
    }));
    
    render(<WFC tiles={dummyTiles} />);
    
    // Expect 100 grid cells and each displays "5".
    const cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    expect(cells.length).toBe(100);
    
    cells.forEach(cell => {
      expect(cell.textContent).toBe('5');
      expect(cell).toHaveClass('wfc-cell-uncollapsed');
    });
    
    // Buttons should be enabled.
    expect(screen.getByTestId('run-wfc-button')).not.toBeDisabled();
    expect(screen.getByTestId('run-wfc-backtracking-button')).not.toBeDisabled();
    expect(screen.getByTestId('reset-button')).not.toBeDisabled();
  });

  it('displays possibility count for uncollapsed cells when only one tile is present', () => {
    // Create a dummy tile array with one tile.
    const dummyTiles = [{
      grid: [[false, false], [false, false]],
      rotationEnabled: false,
      mirrorEnabled: false
    }];
    
    render(<WFC tiles={dummyTiles} />);
    
    const cells = screen.getAllByTestId((content, element) =>
      element.getAttribute('data-testid')?.startsWith('wfc-cell-')
    );
    
    // Each cell should show "1" because possibilitySet = [0].
    cells.forEach(cell => {
      expect(cell.textContent).toBe('1');
      expect(cell).toHaveClass('wfc-cell-uncollapsed');
      expect(cell).not.toHaveClass('wfc-cell-collapsed');
    });
  });
});
