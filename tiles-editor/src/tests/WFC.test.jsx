import { describe, expect, it } from "vitest";
import { gridStatus } from "../wfcUtils";

describe("WFC Component", () => {
  it("gridStatus returns contradiction = true and allCollapsed = false when a cell has 0 possibilities", () => {
    // Create a grid where one cell is already collapsed correctly,
    // and one cell has become contradictory (empty possibility array).
    const testGrid = [
      [{ possibilities: [0], collapsed: true }],
      [{ possibilities: [], collapsed: false }],
    ];
    // Import gridStatus from WFC (since we exported it)
    const status = gridStatus(testGrid);
    expect(status.contradiction).toBe(true);
    expect(status.allCollapsed).toBe(false);
  });
});
