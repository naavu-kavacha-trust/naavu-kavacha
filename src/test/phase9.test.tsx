import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, renderPage } from "@/test/test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Index from "@/pages/Index";
import { SECTION_IDS } from "@/data/siteConfig";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => cleanup());

describe("landmarks and skip link", () => {
  it("puts every section inside one main landmark, after the navigation", () => {
    const { container } = renderPage(<Index />);
    const mains = container.querySelectorAll("main");
    expect(mains).toHaveLength(1);
    const main = mains[0];
    expect(main.id).toBe("main-content");
    // Every home block sits inside <main>; the footer (#contact) is outside it.
    for (const id of [SECTION_IDS.home, SECTION_IDS.aboutTeaser, SECTION_IDS.whatWeDoPreview, SECTION_IDS.impact, SECTION_IDS.volunteerBand]) {
      expect(main.querySelector(`#${id}`), id).not.toBeNull();
    }
    expect(container.querySelector("footer#contact")).not.toBeNull();
    expect(main.contains(container.querySelector("footer"))).toBe(false);
  });

  it("offers a skip link as the very first focusable element", () => {
    const { container } = renderPage(<Index />);
    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(skip).toHaveAttribute("href", "#main-content");
    const firstFocusable = container.querySelector("a[href], button");
    expect(firstFocusable).toBe(skip);
  });
});

describe("opening a shared link", () => {
  it("scrolls to the section named in the URL once the page has rendered", async () => {
    window.history.replaceState(null, "", "/#impact");
    const { container } = renderPage(<Index />);
    const impact = container.querySelector("#impact")!;
    await waitFor(() =>
      expect((Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances).toContain(impact),
    );
  });

  it("does nothing for an id that does not exist on the page", async () => {
    window.history.replaceState(null, "", "/#does-not-exist");
    renderPage(<Index />);
    await new Promise((r) => setTimeout(r, 50));
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});

describe("mobile menu focus", () => {
  it("returns focus to the menu button when closed with Escape", async () => {
    renderPage(<Index />);
    const button = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(button);
    const menu = await screen.findByRole("dialog");
    fireEvent.keyDown(menu, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus());
  });
});

describe("index.html", () => {
  const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");

  it("has a title, description, share image and theme colour", () => {
    expect(html).toMatch(/<title>[^<]{10,}<\/title>/);
    expect(html).toMatch(/<meta name="description" content="[^"]{50,}"/);
    expect(html).toMatch(/property="og:image" content="https:\/\/naavu-kavacha\.vercel\.app\/og-image\.jpg"/);
    expect(html).toMatch(/name="twitter:card"/);
    expect(html).toMatch(/name="theme-color"/);
  });

  it("identifies Naavu Kavacha and its official profiles in organization structured data", () => {
    const jsonLd = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
    expect(jsonLd).toBeDefined();
    const organization = JSON.parse(jsonLd!);
    expect(organization).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Naavu Kavacha Trust",
      url: "https://naavu-kavacha.vercel.app",
      areaServed: "Karnataka",
      sameAs: [
        "https://www.instagram.com/naavu_kavacha",
        "https://www.linkedin.com/company/naavukavacha-trust",
      ],
    });
  });

  it("loads the web fonts once, without blocking the first paint", () => {
    // One non-blocking stylesheet (media="print" swapped to "all" on load) plus its <noscript> fallback.
    expect(html.match(/media="print"/g)).toHaveLength(1);
    expect(html.match(/fonts\.googleapis\.com\/css2/g)).toHaveLength(2);
    expect(html).toContain("<noscript>");
    expect(html.match(/property="og:image"/g)).toHaveLength(1);
  });
});

describe("home: the way to Join Us", () => {
  it("the hero, the Impact section and the closing band each link to the Volunteer page", () => {
    const { container } = renderPage(<Index />);
    for (const id of ["home", "impact", "volunteer-band"]) {
      const section = container.querySelector(`#${id}`);
      expect(section, id).not.toBeNull();
      expect(section!.querySelector('a[href="/volunteer"]'), `#${id} has a Join Us link`).not.toBeNull();
    }
  });
});
