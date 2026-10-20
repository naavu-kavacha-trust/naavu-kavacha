import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, within, renderPage } from "@/test/test-utils";
import Index from "@/pages/Index";
import { activities } from "@/data/activities";
import { INSTAGRAM_URL, LEGAL_ENTITY, ROUTES } from "@/data/siteConfig";

afterEach(() => cleanup());

describe("brand", () => {
  it("shows the legal entity under the name in the header, and in the footer", () => {
    expect(LEGAL_ENTITY).toBe("[Legal Entity: Naavu Kavacha Trust]");
    const { container } = renderPage(<Index />);
    const header = container.querySelector('nav[aria-label="Main"]')!;
    const footer = container.querySelector("footer")!;
    expect(within(header as HTMLElement).getAllByText(LEGAL_ENTITY).length).toBeGreaterThan(0);
    // The footer repeats the legal entity in the bottom row with square brackets.
    expect(within(footer).getByText(LEGAL_ENTITY)).toBeInTheDocument();
  });

  it("puts the round logo in the header, the menu and the footer as a decorative image beside the name", () => {
    const { container } = renderPage(<Index />);
    const logos = container.querySelectorAll('img[src*="logo"]');
    expect(logos.length).toBeGreaterThanOrEqual(2);
    for (const img of logos) {
      expect(img.getAttribute("alt")).toBe("");
      expect(img.className).toContain("rounded-full");
    }
    // The header link still has a sensible name for screen readers.
    const home = container.querySelector('nav[aria-label="Main"] a[href="/"]')!;
    expect(home.textContent).toContain("NAAVU KAVACHA");
  });
});

describe("activity photos", () => {
  it("every activity has at least one photo", () => {
    for (const a of activities) {
      expect(a.images.length, a.id).toBeGreaterThan(0);
      expect(a.coverImage, a.id).not.toBe("");
    }
  });

  it("the newly added photos carry hand-written alt text, not the generic one", () => {
    for (const id of ["awareness", "seed-collection", "growing-ganesha", "bird-feeders"]) {
      const activity = activities.find((a) => a.id === id)!;
      expect(activity.images[0].alt, id).not.toMatch(/Naavu Kavacha photo \d+$/);
      expect(activity.images[0].alt.length, id).toBeGreaterThan(30);
    }
  });
});

describe("footer", () => {
  it("links the Instagram icon to the Instagram page in a new tab", () => {
    const { container } = renderPage(<Index />);
    const footer = container.querySelector("footer")!;
    const insta = within(footer).getByRole("link", { name: /instagram/i });
    expect(insta).toHaveAttribute("href", INSTAGRAM_URL);
    expect(insta).toHaveAttribute("target", "_blank");
    expect(insta.getAttribute("rel")).toContain("noopener");
    expect(insta.querySelector("svg")).not.toBeNull();
  });

  it("lists the quick links, each pointing at a real page, plus Email Us and Back to top", () => {
    const { container } = renderPage(<Index />);
    const footer = container.querySelector("footer")!;
    const nav = within(footer).getByRole("navigation", { name: "Quick links" });
    const links = within(nav).getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(8);
    const pages = Object.values(ROUTES) as string[];
    for (const a of links) {
      const [path] = a.getAttribute("href")!.split("#");
      expect(pages, a.textContent ?? path).toContain(path);
    }
    expect(within(footer).getByRole("button", { name: "Email Us" })).toBeInTheDocument();
    expect(within(footer).getByRole("button", { name: /back to top/i })).toBeInTheDocument();
  });
});
