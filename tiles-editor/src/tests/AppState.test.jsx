import { render, screen } from "@testing-library/react";
import App from "../App";
import { MemoryRouter } from "react-router";
import { test, expect } from "vitest";

test("App initializes with one default tile with a 5x5 grid and disabled options", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );
  // Get the hidden element containing the tile state
  const tileStateElement = screen.getByTestId("tile-state");
  const tileState = JSON.parse(tileStateElement.textContent);

  // Assert that exactly one tile exists
  expect(tileState).toHaveLength(1);

  // Assert that the tile has a 5x5 grid of boolean false values
  const defaultTile = tileState[0];
  expect(Array.isArray(defaultTile.grid)).toBe(true);
  expect(defaultTile.grid.length).toBe(5);
  defaultTile.grid.forEach((row) => {
    expect(Array.isArray(row)).toBe(true);
    expect(row.length).toBe(5);
    row.forEach((cell) => {
      expect(cell).toBe(false);
    });
  });

  // Assert that rotation and mirror options are false
  expect(defaultTile.rotationEnabled).toBe(false);
  expect(defaultTile.mirrorEnabled).toBe(false);
});
