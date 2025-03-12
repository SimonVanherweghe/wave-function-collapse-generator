import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Integration Tests', () => {
  it('updates EdgeOverview in real-time in auto-update mode', async () => {
    render(<App />);
    // By default, auto-update mode is enabled.
    // With one default tile (all false), the unique edge "00000" should have a count of 4.
    await waitFor(() => {
      expect(screen.getByText(/Count: 4/)).toBeInTheDocument();
    });
    
    // Add a tile via the "Add Tile" button.
    const addTileButton = screen.getByRole('button', { name: /add tile/i });
    fireEvent.click(addTileButton);
    
    // With two default tiles, the "00000" edge should now have a count of 8.
    await waitFor(() => {
      expect(screen.getByText(/Count: 8/)).toBeInTheDocument();
    });
    
    // Edit the first tile: toggle the top-left cell (cell 0,0).
    const cell00 = screen.getByTestId('cell-0-0');
    fireEvent.click(cell00);
    
    // In auto-update mode, the edge overview should update automatically.
    // Since toggling a cell will alter at least one edge, we expect more than one unique edge entry.
    await waitFor(() => {
      // Expect at least 2 different edge entries when the tile is modified.
      const edgeItems = screen.getAllByText(/Count:/);
      expect(edgeItems.length).toBeGreaterThan(1);
    });
  });

  it('does not update EdgeOverview in manual mode until refresh is clicked', async () => {
    render(<App />);
    
    // Toggle auto-update off in the EdgeOverview.
    const autoUpdateCheckbox = screen.getByTestId('auto-update-checkbox');
    fireEvent.click(autoUpdateCheckbox);
    expect(autoUpdateCheckbox.checked).toBe(false);
    
    // With one default tile, aggregated edges should show a count of 4.
    await waitFor(() => {
      expect(screen.getByText(/Count: 4/)).toBeInTheDocument();
    });
    
    // Add a tile. Since auto-update is off, EdgeOverview should NOT update automatically.
    const addTileButton = screen.getByRole('button', { name: /add tile/i });
    fireEvent.click(addTileButton);
    
    // Give a short time for any inadvertent updates (which should not happen).
    await new Promise((res) => setTimeout(res, 300));
    // Still showing the initial count.
    let edgeItem = screen.getByText(/Count: 4/);
    expect(edgeItem).toBeInTheDocument();
    
    // Now, click the Refresh button.
    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);
    
    // After clicking refresh, with two default tiles the same edge ("00000") should now have count 8.
    await waitFor(() => {
      expect(screen.getByText(/Count: 8/)).toBeInTheDocument();
    });
  });
});
