import { render, screen } from '@testing-library/react';
import WFC from '../components/WFC';
import { describe, it, expect } from 'vitest';
import { gridStatus } from '../wfcUtils';

describe('WFC Component', () => {
  it('renders correctly and initializes a 10x10 grid when no tiles are provided', async () => {
    // When no tiles are provided, effectiveTiles is []
    render(<WFC tiles={[]} />);
    
    // Check that the "Run WFC" button is rendered and disabled.
    expect(screen.getByTestId('run-wfc-button')).toBeInTheDocument();
    expect(screen.getByTestId('run-wfc-button')).toBeDisabled();
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
    expect(screen.getByTestId('reset-button')).not.toBeDisabled();
  });

  it('sets CSS custom properties based on numRows and numCols', () => {
    const dummyTiles = [{
      grid: [[false]],
      rotationEnabled: false,
      mirrorEnabled: false
    }];
    // Render WFC with custom grid dimensions.
    render(<WFC tiles={dummyTiles} numRows={15} numCols={12} />);
    const gridContainer = screen.getByTestId('wfc-grid-container');
    expect(gridContainer.style.getPropertyValue('--grid-cols')).toBe("12");
    expect(gridContainer.style.getPropertyValue('--grid-rows')).toBe("15");
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

  it("gridStatus returns contradiction = true and allCollapsed = false when a cell has 0 possibilities", () => {
    // Create a grid where one cell is already collapsed correctly,
    // and one cell has become contradictory (empty possibility array).
    const testGrid = [
      [ { possibilities: [0], collapsed: true } ],
      [ { possibilities: [], collapsed: false } ]
    ];
    // Import gridStatus from WFC (since we exported it)
    const status = gridStatus(testGrid);
    expect(status.contradiction).toBe(true);
    expect(status.allCollapsed).toBe(false);
  });
});
