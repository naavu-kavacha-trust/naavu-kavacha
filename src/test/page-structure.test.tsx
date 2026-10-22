import { afterEach, describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent, renderPage } from "@/test/test-utils";
import Index from "@/pages/Index";
import SmartImage from "@/components/ui/SmartImage";
import { NAV_ITEMS, EMAIL, ROUTES, isRouteHref } from "@/data/siteConfig";

describe("page structure", () => {
  it("the home page shows only its own blocks, in order, and none of the moved sections", () => {
    const { container } = renderPage(<Index />);
    const ids = Array.from(container.querySelectorAll("section[id], footer[id]")).map((el) => el.id);
    // The gallery preview is absent here because the site has fewer than 3 real photos so far
    // (home-page.test.tsx covers it with enough photos).
    expect(ids).toEqual(["home", "about-teaser", "what-we-do-preview", "impact", "volunteer-band", "contact"]);
    for (const moved of ["about", "whatwedo", "projects", "special-moments", "gallery", "journey", "future", "volunteer", "faq"]) {
      expect(container.querySelector(`#${moved}`), `#${moved} moved to its own page`).toBeNull();
    }
  });

  it("every nav item points at a real page, or at the footer that every page has", () => {
    const { container } = renderPage(<Index />);
    const pages = Object.values(ROUTES) as string[];
    for (const item of NAV_ITEMS) {
      if (isRouteHref(item.href)) expect(pages, item.href).toContain(item.href);
      else expect(container.querySelector(item.href), item.href).not.toBeNull();
    }
  });

  it("has no links left pointing at the old #connect id", () => {
    const { container } = renderPage(<Index />);
    expect(container.querySelector('a[href="#connect"]')).toBeNull();
  });

  it("keeps the contact email in one place", () => {
    expect(EMAIL).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });
});

describe("SmartImage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("waits until an image is near the viewport, then starts it eagerly", () => {
    let observer: {
      options?: IntersectionObserverInit;
      callback: IntersectionObserverCallback;
      intersect: () => void;
    } | undefined;
    class MockIntersectionObserver {
      private target?: Element;
      options?: IntersectionObserverInit;
      constructor(public callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.options = options;
        observer = {
          options,
          callback,
          intersect: () =>
            callback(
              [{ isIntersecting: true, target: this.target ?? document.body } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            ),
        };
      }
      observe(target: Element) { this.target = target; }
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    render(<SmartImage src="/a.jpg" srcSet="/a-384.webp 384w, /a-768.webp 768w" alt="First" />);
    const image = screen.getByAltText("First");
    expect(image.getAttribute("src")).toBeNull();
    expect(image.getAttribute("srcset")).toBeNull();
    expect(observer?.options?.rootMargin).toBe("300px 0px");

    act(() => observer?.intersect());
    expect(image.getAttribute("src")).toBe("/a.jpg");
    expect(image.getAttribute("srcset")).toBe("/a-384.webp 384w, /a-768.webp 768w");
    expect(image.getAttribute("loading")).toBe("eager");
  });

  it("loads explicitly prioritized images immediately with high fetch priority", () => {
    let observed = false;
    class MockIntersectionObserver {
      constructor() { observed = true; }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    render(<SmartImage src="/a.jpg" alt="First" priority />);
    const image = screen.getByAltText("First");
    expect(image.getAttribute("src")).toBe("/a.jpg");
    expect(image.getAttribute("loading")).toBe("eager");
    expect(image.getAttribute("fetchpriority")).toBe("high");
    expect(observed).toBe(false);
  });

  it("re-observes a changed image source before requesting the replacement", () => {
    const observers: Array<{ intersect: () => void }> = [];
    class MockIntersectionObserver {
      private target?: Element;
      constructor(private readonly callback: IntersectionObserverCallback) {
        observers.push({
          intersect: () =>
            this.callback(
              [{ isIntersecting: true, target: this.target ?? document.body } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            ),
        });
      }
      observe(target: Element) { this.target = target; }
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const { rerender } = render(<SmartImage src="/first.jpg" alt="First" />);
    const image = screen.getByAltText("First");
    act(() => observers[0].intersect());
    expect(image.getAttribute("src")).toBe("/first.jpg");

    rerender(<SmartImage src="/second.jpg" alt="Second" />);
    const replacement = screen.getByAltText("Second");
    expect(replacement.getAttribute("src")).toBeNull();
    act(() => observers[1].intersect());
    expect(replacement.getAttribute("src")).toBe("/second.jpg");
  });

  it("falls back to native lazy loading when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<SmartImage src="/a.jpg" alt="First" />);
    const image = screen.getByAltText("First");
    expect(image.getAttribute("src")).toBe("/a.jpg");
    expect(image.getAttribute("loading")).toBe("lazy");
  });

  it("falls back to a placeholder when the image fails", () => {
    render(<SmartImage src="/missing.jpg" alt="Volunteers planting saplings" />);
    fireEvent.error(screen.getByAltText("Volunteers planting saplings"));
    expect(screen.getByRole("img", { name: "Volunteers planting saplings" }).tagName).toBe("DIV");
  });
});
