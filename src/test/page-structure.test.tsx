import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, renderPage } from "@/test/test-utils";
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
  it("lazy-loads by default and eagerly when priority is set", () => {
    const { rerender } = render(<SmartImage src="/a.jpg" alt="First" />);
    expect(screen.getByAltText("First").getAttribute("loading")).toBe("lazy");
    rerender(<SmartImage src="/a.jpg" alt="First" priority />);
    expect(screen.getByAltText("First").getAttribute("loading")).toBe("eager");
  });

  it("falls back to a placeholder when the image fails", () => {
    render(<SmartImage src="/missing.jpg" alt="Volunteers planting saplings" />);
    fireEvent.error(screen.getByAltText("Volunteers planting saplings"));
    expect(screen.getByRole("img", { name: "Volunteers planting saplings" }).tagName).toBe("DIV");
  });
});
