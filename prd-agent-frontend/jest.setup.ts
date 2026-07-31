import "@testing-library/jest-dom";
import "jest-canvas-mock";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();
window.open = jest.fn();
