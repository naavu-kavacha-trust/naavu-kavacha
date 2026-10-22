import { beforeAll } from "vitest";
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom lacks these browser APIs, which framer-motion, scroll-spy and anchors rely on.
class IntersectionObserverStub {
  constructor(
    private readonly callback: IntersectionObserverCallback,
    private readonly options?: IntersectionObserverInit,
  ) {}
  observe(target: Element) {
    if (this.options?.rootMargin === "300px 0px") {
      this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
});

// Embla (the carousel) observes element sizes.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: ResizeObserverStub,
});

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom does not implement window.scrollTo (the page shell scrolls to the top on page changes).
window.scrollTo = () => {};

// Lazy chunks (activity pop-up, volunteer form, animation features) resolve a tick after the first
// render. Render the page once up front so every test starts with them already resolved.
beforeAll(async () => {
  const { act, cleanup, renderPage } = await import("@/test/test-utils");
  const { createElement } = await import("react");
  const { default: Index } = await import("@/pages/Index");
  const { default: VolunteerPage } = await import("@/pages/VolunteerPage");
  // The volunteer form is lazy and lives on the Volunteer page; the activity pop-up loads with any page.
  renderPage(createElement(Index));
  cleanup();
  renderPage(createElement(VolunteerPage));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  cleanup();
  window.history.replaceState(null, "", "/");
});
