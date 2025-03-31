import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";
import { MemoryRouter } from "react-router";

describe("Remove Tile Feature", () => {
  it("removes a tile when the Remove Tile button is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    // Initially, the app must have one default tile.
    let startTileHeader = screen.getAllByText(/Tile \d+/);
    expect(startTileHeader.length).toBe(1);

    // Click the "Add Tile" button to add an extra tile.
    const addTileButton = screen.getByText(/Add Tile/i);
    fireEvent.click(addTileButton);

    // Now, expecting 2 tile headers (the default tile plus additional one).
    let tileHeaders = screen.getAllByText(/Tile \d+/);
    expect(tileHeaders.length).toBe(2);

    // Click the remove button for the first tile.
    const removeButton0 = screen.getByTestId("remove-tile-0");
    fireEvent.click(removeButton0);

    // After removal, the number of tile headers should be reduced by one (i.e. 1 remain).
    await waitFor(() => {
      tileHeaders = screen.getAllByText(/Tile \d+/);
      expect(tileHeaders.length).toBe(1);
    });
  });
});
