import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";

// Mock canvas context for tests
class CanvasRenderingContext2DMock {
  clearRect() {}
  fillRect() {}
  fillText() {}
  strokeRect() {}
  
  // Add any other methods used in your canvas code
  beginPath() {}
  arc() {}
  fill() {}
  stroke() {}
  
  // Mock text measurement
  measureText() { return { width: 10 }; }
  
  // Style properties
  fillStyle = '#000';
  strokeStyle = '#000';
  lineWidth = 1;
  font = '10px Arial';
  textAlign = 'center';
  textBaseline = 'middle';
}

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function() {
  return new CanvasRenderingContext2DMock();
};

afterEach(() => {
  cleanup();
  localStorage.clear();
});
