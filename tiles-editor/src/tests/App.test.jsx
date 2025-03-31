import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, test } from "vitest";
import App from "../App";
import { MemoryRouter } from "react-router";

test("renders tile overview and WFC sections", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );
  const tileSection = screen.getByTestId("tile-overview");
  const wfcSection = screen.getByTestId("wfc-section");
  expect(tileSection).toBeInTheDocument();
  expect(wfcSection).toBeInTheDocument();
});

describe("App component", () => {
  it('increments the number of Tile components when clicking the "Add Tile" button', () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    // Get the initial count of rendered Tile components
    const initialTiles = container.querySelectorAll(".tile-wrapper");
    const initialCount = initialTiles.length;

    // Find and click the "Add Tile" button (case-insensitive)
    const addButton = screen.getByRole("button", { name: /add tile/i });
    fireEvent.click(addButton);

    // After click, verify that the number of Tile components increased by 1
    const updatedTiles = container.querySelectorAll(".tile-wrapper");
    expect(updatedTiles.length).toBe(initialCount + 1);
  });
});
