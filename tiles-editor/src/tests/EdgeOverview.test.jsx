import { render, screen, fireEvent } from '@testing-library/react';
import EdgeOverview from '../components/EdgeOverview';
import { describe, it, expect, vi } from 'vitest';

describe('EdgeOverview component and edge calculations', () => {
  // Create a custom tile with a known grid.
  // This grid produces the same edge "10001" for all four sides:
  // Top: [true,false,false,false,true] => "10001"
  // Right: same, Bottom (reversed but equal), Left (reversed but equal)
  const customTile = {
    grid: [
      [true, false, false, false, true],
      [false, false, false, false, false],
      [false, false, true, false, false],
      [false, false, false, false, false],
      [true, false, false, false, true],
    ],
    rotationEnabled: false,
    mirrorEnabled: false,
  };

  it('calculates unique edge correctly for a single tile', () => {
    // For one tile, its four edges are all "10001".
    // The aggregator collects these into one unique edge with a count of 4.
    const { container } = render(<EdgeOverview tiles={[customTile]} />);
    
    // Select each unique edge item element via the CSS class.
    const edgeItems = container.querySelectorAll('.edge-item');
    
    // There should be exactly 1 unique edge displayed.
    expect(edgeItems.length).toBe(1);
    
    // The count should be 4 (four edges for one tile).
    expect(edgeItems[0].textContent).toContain('Count: 4');
  });

  it('aggregates edges from multiple tiles', () => {
    // If we pass two identical tiles, each contributes four edges,
    // so we expect one unique edge occurring 8 times.
    const { container } = render(<EdgeOverview tiles={[customTile, customTile]} />);
    
    // Again, only one unique edge should be rendered.
    const edgeItems = container.querySelectorAll('.edge-item');
    expect(edgeItems.length).toBe(1);
    
    // The count should now be 8 (4 edges per tile × 2 tiles).
    expect(edgeItems[0].textContent).toContain('Count: 8');
  });
  
  it('toggles auto-update mode correctly', () => {
    render(<EdgeOverview tiles={[customTile]} />);
    
    // Auto-update should be enabled by default
    const autoUpdateCheckbox = screen.getByTestId('auto-update-checkbox');
    expect(autoUpdateCheckbox.checked).toBe(true);
    
    // Refresh button should not be visible in auto-update mode
    expect(screen.queryByTestId('refresh-button')).not.toBeInTheDocument();
    
    // Toggle auto-update off
    fireEvent.click(autoUpdateCheckbox);
    expect(autoUpdateCheckbox.checked).toBe(false);
    
    // Refresh button should now be visible
    expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
  });
  
  it('only updates edges after refresh button click in manual mode', () => {
    // Start with one tile
    const { container, rerender } = render(<EdgeOverview tiles={[customTile]} />);
    
    // Turn off auto-update
    const autoUpdateCheckbox = screen.getByTestId('auto-update-checkbox');
    fireEvent.click(autoUpdateCheckbox);
    
    // Initial state: one unique edge with count 4
    let edgeItems = container.querySelectorAll('.edge-item');
    expect(edgeItems.length).toBe(1);
    expect(edgeItems[0].textContent).toContain('Count: 4');
    
    // Update props with two tiles, but don't refresh
    rerender(<EdgeOverview tiles={[customTile, customTile]} />);
    
    // Edge count should still be 4 since we're in manual mode and haven't refreshed
    edgeItems = container.querySelectorAll('.edge-item');
    expect(edgeItems[0].textContent).toContain('Count: 4');
    
    // Click refresh button
    fireEvent.click(screen.getByTestId('refresh-button'));
    
    // Now the edge count should update to 8
    edgeItems = container.querySelectorAll('.edge-item');
    expect(edgeItems[0].textContent).toContain('Count: 8');
  });
});
