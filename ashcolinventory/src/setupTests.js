// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Layout APIs are absent in jsdom; real layout is checked in browser-smoke.js.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
const browserComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element) => browserComputedStyle(element);
global.MessageChannel = class {
  constructor() {
    this.port1 = { onmessage: null };
    this.port2 = {
      postMessage: () =>
        setTimeout(() => {
          if (this.port1.onmessage) this.port1.onmessage();
        }, 0),
    };
  }
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
