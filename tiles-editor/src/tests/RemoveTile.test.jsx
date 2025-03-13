import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('Remove Tile Feature', () => {
  it('removes a tile when the Remove Tile button is clicked', async () => {
    render(<App />);
    
    // Initially, there is one default tile. Add an extra tile for testing removal.
    const addTileButton = screen.getByText(/Add Tile/i);
    fireEvent.click(addTileButton);
    
    // Now expect 2 tiles; check by counting all "Tile" headers.
    let tileHeaders = screen.getAllByText(/Tile \d+/);
    expect(tileHeaders.length).toBe(2);
    
    // Click the remove button for the first tile.
    const removeButton0 = screen.getByTestId('remove-tile-0');
    fireEvent.click(removeButton0);
    
    // Now expect the number of tile headers to be reduced by one.
    await waitFor(() => {
      tileHeaders = screen.getAllByText(/Tile \d+/);
      expect(tileHeaders.length).toBe(1);
    });
  });
});
