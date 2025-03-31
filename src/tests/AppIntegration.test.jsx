import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";
import { MemoryRouter } from "react-router";

describe("App Integration Tests", () => {
  it("shows edge patterns when navigating to the edge patterns page", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    // Initially we should be on the home page with WFC section
    expect(screen.getByTestId("wfc-section")).toBeInTheDocument();

    // Navigate to edge patterns page
    const edgePatternsLink = screen.getByText("Edge Patterns");
    fireEvent.click(edgePatternsLink);

    // Now we should see the edge overview with occurrences
    await waitFor(() => {
      expect(screen.getByText("Edge Pattern Overview")).toBeInTheDocument();

      expect(
        screen.getByText((content) => content.includes("Occurrences: 4"))
      ).toBeInTheDocument();
    });
  });
});
