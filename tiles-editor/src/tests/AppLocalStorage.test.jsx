import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';

describe('Local Storage Integration in App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves data from local storage on loading', () => {
    // Prepare a custom tile stored in localStorage.
    const customTile = {
      grid: Array(5)
        .fill(null)
        .map(() => Array(5).fill(true)),
      rotationEnabled: true,
      mirrorEnabled: true,
    };
    const storedTiles = [customTile];
    localStorage.setItem('tiles', JSON.stringify(storedTiles));

    // Render App and verify that the state reflects the stored data.
    render(<App />);
    const tileStateElement = screen.getByTestId('tile-state');
    const parsedState = JSON.parse(tileStateElement.textContent);
    expect(parsedState).toEqual(storedTiles);
  });

  it('updates local storage when a tile is updated', async () => {
    // Render App with its default tile.
    render(<App />);
    const cell = screen.getByTestId('tile-0-cell-0-0');

    // Click the first cell, toggling its state
    fireEvent.click(cell);

    // Wait for localStorage to update via the useEffect in App.jsx
    await waitFor(() => {
      const storedTiles = JSON.parse(localStorage.getItem('tiles'));
      expect(storedTiles[0].grid[0][0]).toBe(true);
    });
  });
});
