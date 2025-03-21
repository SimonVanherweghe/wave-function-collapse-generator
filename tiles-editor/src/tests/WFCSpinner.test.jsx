import { render, fireEvent, waitFor } from "@testing-library/react";
import WFC from "../components/WFC";

test("shows loading spinner while the WFC algorithm is running", async () => {
  // Provide at least one tile so hasTiles is true.
  const sampleTile = {
    grid: Array(5)
      .fill(null)
      .map(() => Array(5).fill(false)),
    rotationEnabled: false,
    mirrorEnabled: false,
    weight: 1,
  };
  const tiles = [sampleTile];

  // Render the component with minimal grid dimensions
  const { getByTestId, queryByTestId } = render(
    <WFC tiles={tiles} numRows={5} numCols={5} />
  );

  // Start the algorithm
  fireEvent.click(getByTestId("run-wfc-button"));

  // Immediately, the spinner should be present
  expect(getByTestId("wfc-spinner")).toBeInTheDocument();

  // Wait for the algorithm to complete and spinner to be removed.
  await waitFor(() => expect(queryByTestId("wfc-spinner")).toBeNull(), {
    timeout: 2000,
  });
});
