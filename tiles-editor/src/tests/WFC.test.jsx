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
});
