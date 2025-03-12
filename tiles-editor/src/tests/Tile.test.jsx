import { render, fireEvent, screen } from '@testing-library/react';
import Tile from '../components/Tile';
import { describe, it, expect } from 'vitest';

describe('Tile component', () => {
  const defaultTile = {
    grid: Array(5).fill(null).map(() => Array(5).fill(false)),
    rotationEnabled: false,
    mirrorEnabled: false,
  };

  it('toggles a cell state on click', () => {
    let updatedTile = null;
    const handleUpdate = (tile) => { updatedTile = tile; };

    render(<Tile tile={defaultTile} onUpdate={handleUpdate} />);
    
    const cell = screen.getByTestId('cell-0-0');
    // Initially white
    expect(cell).toHaveStyle('background-color: white');
    
    // Simulate click on cell (0, 0)
    fireEvent.click(cell);
    
    // The update callback should now reflect that cell (0, 0) is true
    expect(updatedTile.grid[0][0]).toBe(true);
    // Also check that the DOM style changed
    expect(cell).toHaveStyle('background-color: black');
  });

  it('updates rotation and mirror options on checkbox toggle', () => {
    let updatedTile = null;
    const handleUpdate = (tile) => { updatedTile = tile; };

    render(<Tile tile={defaultTile} onUpdate={handleUpdate} />);
    
    const rotationCheckbox = screen.getByTestId('rotation-checkbox');
    const mirrorCheckbox = screen.getByTestId('mirror-checkbox');
    
    // Verify initial state of the checkboxes
    expect(rotationCheckbox.checked).toBe(false);
    expect(mirrorCheckbox.checked).toBe(false);
    
    // Toggle rotation checkbox
    fireEvent.click(rotationCheckbox);
    expect(rotationCheckbox.checked).toBe(true);
    expect(updatedTile.rotationEnabled).toBe(true);

    // Toggle mirror checkbox
    fireEvent.click(mirrorCheckbox);
    expect(mirrorCheckbox.checked).toBe(true);
    expect(updatedTile.mirrorEnabled).toBe(true);
  });
});
