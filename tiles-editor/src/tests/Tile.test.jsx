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

    render(<Tile tile={defaultTile} tileId={0} onUpdate={handleUpdate} />);
    
    const cell = screen.getByTestId('tile-0-cell-0-0');
    // Initially not active (white)
    expect(cell).not.toHaveClass('active');
    
    // Simulate click on cell (0, 0)
    fireEvent.click(cell);
    
    // The update callback should now reflect that cell (0, 0) is true
    expect(updatedTile.grid[0][0]).toBe(true);
    // Also check that the DOM class changed
    expect(cell).toHaveClass('active');
  });

  it('updates rotation and mirror options on checkbox toggle', () => {
    let updatedTile = null;
    const handleUpdate = (tile) => { updatedTile = tile; };

    render(<Tile tile={defaultTile} tileId={0} onUpdate={handleUpdate} />);
    
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

  it('updates tile weight when numeric field is changed', () => {
    let updatedTile = null;
    const handleUpdate = (tile) => { updatedTile = tile; };

    const defaultTile = {
      grid: Array(5).fill(null).map(() => Array(5).fill(false)),
      rotationEnabled: false,
      mirrorEnabled: false,
      weight: 1,
    };

    render(<Tile tile={defaultTile} tileId={0} onUpdate={handleUpdate} />);
    
    const weightInput = screen.getByTestId('weight-input');
    expect(weightInput.value).toBe("1");
    fireEvent.change(weightInput, { target: { value: '5' } });
    expect(updatedTile.weight).toBe(5);
  });
});
