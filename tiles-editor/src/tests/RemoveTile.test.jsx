import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('Remove Tile Feature', () => {
  it('removes a tile when the Remove Tile button is clicked', async () => {
    render(<App />);
    
    // Initially, the app may have one default tile.
    // Click the "Add Tile" button to add an extra tile.
    const addTileButton = screen.getByText(/Add Tile/i);
    fireEvent.click(addTileButton);
    
    // Now, expecting 3 tile headers (the default tile plus additional ones).
    let tileHeaders = screen.getAllByText(/Tile \d+/);
    expect(tileHeaders.length).toBe(3);
    
    // Click the remove button for the first tile.
    const removeButton0 = screen.getByTestId('remove-tile-0');
    fireEvent.click(removeButton0);
    
    // After removal, the number of tile headers should be reduced by one (i.e. 2 remain).
    await waitFor(() => {
      tileHeaders = screen.getAllByText(/Tile \d+/);
      expect(tileHeaders.length).toBe(2);
    });
  });
});
