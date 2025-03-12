import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders tile overview and edge overview sections', () => {
  render(<App />);
  const tileSection = screen.getByTestId('tile-overview');
  const edgeSection = screen.getByTestId('edge-overview');
  expect(tileSection).toBeInTheDocument();
  expect(edgeSection).toBeInTheDocument();
});
