# Tiles Editor Specification

## Frameworks and Libraries

- **React**: For user interface components and state management.
- **P5.js**: For drawing and interactivity within the tile editing area.

## Application Structure

- **Layout**:
  - **Left Section**: Tile overview with individual 5x5 grids.
  - **Right Section**: Edge overview in a visual grid format.

## Functional Requirements

1. **Tile Management**:
   - Instant editing on a default tile.
   - Ability to add new tiles through an 'Add' button.
   - Each tile can be toggled for rotation and mirroring using checkboxes.

2. **Tile Interaction**:
   - Each cell in the 5x5 grid is clickable to toggle between black and white.
   - Visual indicators (animations or highlights) when a tile is updated.

3. **Edge Overview**:
   - Display unique edges and corresponding counts in a visual grid.
   - Real-time updates as tiles are edited, with an option to toggle to manual refresh mode.

4. **Feedback Mechanisms**:
   - Visual indicators for successful actions or modifications.

5. **Data Persistence**:
   - Store all tiles and related settings in the browser's local storage.

## Technical Specifications

- **React Components**:
  - Main: Manages state and layout of the application.
  - Tile: Represents individual tiles with draw toggle functionality.
  - EdgeOverview: Displays unique edges and counts.

- **State Management**:
  - Use React's `useState` and `useEffect` for real-time updates and local storage syncing.

- **Data Handling**:
  - Serialize and deserialize tiles to/from JSON for local storage.
  - Use local storage to persist tile data across sessions.

## Error Handling Strategies

- **Validation**: Ensure valid tile settings before saving to local storage.
- **Feedback**: Use visual indicators to alert users to any errors or invalid actions.

## Testing Plan

- **Unit Testing**: For individual components using Jest and React Testing Library.
- **Integration Testing**:
  - Check interaction between components (e.g., ensuring edge overview updates as expected).
  - Validate local storage integration.
- **Manual Testing**: User acceptance testing for UI/UX validation.
