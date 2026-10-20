import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderPage } from "@/test/test-utils";
import Index from "@/pages/Index";
import AboutPage from "@/pages/AboutPage";
import OurWorkPage from "@/pages/OurWorkPage";
import VolunteerPage from "@/pages/VolunteerPage";
import GalleryPage from "@/pages/GalleryPage";
import GalleryPreview from "@/components/GalleryPreview";
import Footer from "@/components/Footer";
import { getWhatWeDoActivities } from "@/data/activities";
import { TEASER_PARAGRAPHS } from "@/data/about";
import { getHeadlineStats, formatStat } from "@/data/impact";
import {
  HOME_GALLERY_LIMIT,
  HOME_GALLERY_MIN,
  HOME_WHAT_WE_DO_LIMIT,
  INSTAGRAM_URL,
  ROUTES,
  WHATSAPP_CHANNEL_URL,
} from "@/data/siteConfig";
import type { GalleryImage } from "@/data/gallery";
import { MemoryRouter } from "react-router-dom";

// The site has one real photo so far. For the full six-block home page we pretend there are enough.
vi.mock("@/data/gallery", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/gallery")>();
  const photos = Array.from({ length: 8 }, (_, i) => ({ src: `/photo-${i + 1}.jpg`, alt: `Photo ${i + 1}` }));
  return { ...actual, galleryImages: photos };
});

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
});
afterEach(() => cleanup());

const photos = (n: number): GalleryImage[] =>
  Array.from({ length: n }, (_, i) => ({ src: `/p${i}.jpg`, alt: `Photo ${i + 1}` }));
const hrefOf = (el: Element | null) => el?.getAttribute("href");

describe("home: exactly six blocks, none of the moved sections", () => {
  it("shows hero, about teaser, what we do preview, impact, gallery preview and the volunteer band in order", () => {
    const { container } = renderPage(<Index />);
    const ids = Array.from(container.querySelectorAll("main > section[id]")).map((s) => s.id);
    expect(ids).toEqual(["home", "about-teaser", "what-we-do-preview", "impact", "gallery-preview", "volunteer-band"]);
  });

  it("leaves out every section that now lives on its own page", () => {
    const { container } = renderPage(<Index />);
    for (const id of ["about", "whatwedo", "projects", "special-moments", "gallery", "journey", "future", "volunteer", "faq"]) {
      expect(container.querySelector(`#${id}`), `#${id}`).toBeNull();
    }
    // Nor the volunteer form.
    expect(screen.queryByRole("checkbox", { name: "Clean-Up drives" })).toBeNull();
  });

  it("has one h1 (the hero) and h2s for the other blocks", () => {
    const { container } = renderPage(<Index />);
    expect(container.querySelectorAll("main h1")).toHaveLength(1);
    const blocks = Array.from(container.querySelectorAll("main > section")).slice(1);
    for (const b of blocks) expect(b.querySelector("h2"), b.id).not.toBeNull();
  });
});

describe("home: every call to action goes to the right place", () => {
  it("hero: Explore Our Work → /our-work, Become a Volunteer → /volunteer", () => {
    const { container } = renderPage(<Index />);
    const hero = within(container.querySelector("#home") as HTMLElement);
    expect(hrefOf(hero.getByRole("link", { name: "Explore Our Work" }))).toBe(ROUTES.ourWork);
    expect(hrefOf(hero.getByRole("link", { name: "Become a Volunteer" }))).toBe(ROUTES.volunteer);
  });

  it("about teaser: Our story & team → /about", () => {
    const { container } = renderPage(<Index />);
    const teaser = within(container.querySelector("#about-teaser") as HTMLElement);
    expect(hrefOf(teaser.getByRole("link", { name: "Our story & team" }))).toBe(ROUTES.about);
  });

  it("what we do preview: See all projects & activities → /our-work", () => {
    const { container } = renderPage(<Index />);
    const preview = within(container.querySelector("#what-we-do-preview") as HTMLElement);
    expect(hrefOf(preview.getByRole("link", { name: /See all projects & activities/ }))).toBe(ROUTES.ourWork);
  });

  it("impact: Join Us → /volunteer", () => {
    const { container } = renderPage(<Index />);
    expect(hrefOf(within(container.querySelector("#impact") as HTMLElement).getByRole("link", { name: "Join Us" }))).toBe(
      ROUTES.volunteer,
    );
  });

  it("gallery preview: View the full gallery and every photo → /gallery", () => {
    const { container } = renderPage(<Index />);
    const preview = container.querySelector("#gallery-preview") as HTMLElement;
    expect(hrefOf(within(preview).getByRole("link", { name: "View the full gallery" }))).toBe(ROUTES.gallery);
    const photoLinks = within(preview).getAllByRole("link", { name: /^See this photo in the gallery/ });
    expect(photoLinks.length).toBeGreaterThan(0);
    for (const a of photoLinks) expect(hrefOf(a)).toBe(ROUTES.gallery);
  });

  it("volunteer band: a filled button to /volunteer plus the Instagram and WhatsApp links from the config", () => {
    const { container } = renderPage(<Index />);
    const band = within(container.querySelector("#volunteer-band") as HTMLElement);
    expect(hrefOf(band.getByRole("link", { name: "Become a Volunteer" }))).toBe(ROUTES.volunteer);
    const insta = band.getByRole("link", { name: /Instagram/ });
    const whatsapp = band.getByRole("link", { name: /WhatsApp/ });
    expect(hrefOf(insta)).toBe(INSTAGRAM_URL);
    expect(hrefOf(whatsapp)).toBe(WHATSAPP_CHANNEL_URL);
    for (const a of [insta, whatsapp]) {
      expect(a).toHaveAttribute("target", "_blank");
      expect(a.getAttribute("rel")).toContain("noopener");
    }
  });
});

describe("home: What We Do preview", () => {
  const first = () => getWhatWeDoActivities().slice(0, HOME_WHAT_WE_DO_LIMIT);

  it("previews the first three cards in the usual order, and only those", () => {
    expect(HOME_WHAT_WE_DO_LIMIT).toBe(3);
    const { container } = renderPage(<Index />);
    const buttons = Array.from(container.querySelectorAll("#what-we-do-preview [data-whatwedo-card]"));
    expect(buttons.map((b) => b.getAttribute("data-whatwedo-card"))).toEqual(first().map((a) => a.id));
  });

  it("shows the same titles as the Our Work page's first cards", () => {
    const home = renderPage(<Index />);
    const homeTitles = Array.from(home.container.querySelectorAll("#what-we-do-preview [data-whatwedo-card]")).map((b) => b.textContent);
    home.unmount();
    const work = renderPage(<OurWorkPage />);
    const workTitles = Array.from(work.container.querySelectorAll("#whatwedo [data-whatwedo-card]"))
      .slice(0, HOME_WHAT_WE_DO_LIMIT)
      .map((b) => b.textContent);
    expect(homeTitles).toEqual(workTitles);
  });

  it("a card opens the activity pop-up; closing it leaves the plain home URL and returns focus to the card", async () => {
    renderPage(<Index />);
    const card = document.querySelector<HTMLElement>("#what-we-do-preview [data-whatwedo-card]")!;
    card.focus();
    fireEvent.click(card);
    const dialog = await screen.findByRole("dialog");
    expect(window.location.hash).toMatch(/^#projects\/.+/);
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(window.location.pathname).toBe("/");
    expect(window.location.hash).toBe("");
    await waitFor(() => expect(document.activeElement).toBe(card));
  });
});

describe("home: gallery preview", () => {
  const renderPreview = (images: GalleryImage[]) =>
    render(
      <MemoryRouter>
        <GalleryPreview images={images} />
      </MemoryRouter>,
    );

  it(`renders nothing with fewer than ${HOME_GALLERY_MIN} photos (no placeholder tiles)`, () => {
    expect(HOME_GALLERY_MIN).toBe(3);
    for (const n of [0, 1, 2]) {
      const { container, unmount } = renderPreview(photos(n));
      expect(container).toBeEmptyDOMElement();
      unmount();
    }
  });

  it("shows three photos when there are three", () => {
    const { container } = renderPreview(photos(3));
    expect(container.querySelectorAll("li")).toHaveLength(3);
    expect(container.querySelector('[role="img"]')).toBeNull();
  });

  it(`shows at most ${HOME_GALLERY_LIMIT} photos`, () => {
    expect(HOME_GALLERY_LIMIT).toBe(6);
    const { container } = renderPreview(photos(20));
    expect(container.querySelectorAll("li")).toHaveLength(6);
  });

  it("reserves a fixed shape for each photo so nothing shifts as images load", () => {
    const { container } = renderPreview(photos(4));
    for (const link of container.querySelectorAll("li a")) expect(link.className).toContain("aspect-[4/3]");
  });

  it("the real site hides it today: only one photo exists yet", async () => {
    vi.doUnmock("@/data/gallery");
    const actual = await vi.importActual<typeof import("@/data/gallery")>("@/data/gallery");
    expect(actual.galleryImages.length).toBeLessThan(HOME_GALLERY_MIN);
  });
});

describe("home: about teaser uses the About page's own words", () => {
  it("repeats the start of the About story and the two verified figures, and adds nothing", () => {
    const home = renderPage(<Index />);
    const teaser = home.container.querySelector("#about-teaser") as HTMLElement;
    const teaserText = teaser.querySelector("p.section-subtitle")!.textContent!.replace(/\s+/g, " ").trim();
    const figures = getHeadlineStats().map((s) => formatStat(s));
    for (const f of figures) expect(teaser.textContent).toContain(f);
    home.unmount();

    const about = renderPage(<AboutPage />);
    const story = Array.from(about.container.querySelectorAll("#story .max-w-prose p")).map((p) => p.textContent!.trim());
    expect(story.length).toBeGreaterThan(0);
    expect(teaserText).toBe(story.slice(0, TEASER_PARAGRAPHS).join(" "));
  });

  it("only ever shows verified figures", () => {
    for (const s of getHeadlineStats()) expect(s.verified).toBe(true);
  });
});

describe("footer links resolve", () => {
  const pageFor: Record<string, () => JSX.Element> = {
    "/": () => <Index />,
    "/about": () => <AboutPage />,
    "/our-work": () => <OurWorkPage />,
    "/gallery": () => <GalleryPage />,
    "/volunteer": () => <VolunteerPage />,
  };

  const links = () => {
    const { container, unmount } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const nav = container.querySelector('nav[aria-label="Quick links"]') as HTMLElement;
    const out = within(nav)
      .getAllByRole("link")
      .map((a) => ({ label: a.textContent!, href: a.getAttribute("href")! }));
    unmount();
    return out;
  };

  it("lists About Us, Our Work, Our Impact, Gallery, the Journey, Future Plans, Volunteer and FAQ", () => {
    expect(links()).toEqual([
      { label: "About Us", href: "/about" },
      { label: "Our Work", href: "/our-work" },
      { label: "Our Impact", href: "/#impact" },
      { label: "Gallery", href: "/gallery" },
      { label: "The Journey So Far", href: "/about#journey" },
      { label: "Future Plans", href: "/about#future" },
      { label: "Volunteer", href: "/volunteer" },
      { label: "FAQ", href: "/volunteer#faq" },
    ]);
  });

  it("every link opens a real page, and every #section it names exists on that page", () => {
    for (const { label, href } of links()) {
      const [path, hash] = href.split("#");
      expect(pageFor[path], `${label}: ${path} is a page`).toBeDefined();
      if (!hash) continue;
      const { container, unmount } = renderPage(pageFor[path]());
      expect(container.querySelector(`#${hash}`), `${label}: #${hash} on ${path}`).not.toBeNull();
      unmount();
    }
  });

  it("nothing became unreachable: every old section is still on some page reachable from the nav or footer", () => {
    const reachable = new Set<string>();
    for (const [path, page] of Object.entries(pageFor)) {
      const { container, unmount } = renderPage(page());
      container.querySelectorAll("main section[id]").forEach((s) => reachable.add(s.id));
      unmount();
      expect(Object.keys(pageFor)).toContain(path);
    }
    // The old "Who We Are" section is now "Our Story" (#story).
    for (const id of ["story", "whatwedo", "impact", "projects", "special-moments", "gallery", "journey", "future", "volunteer", "faq"]) {
      expect(reachable.has(id), `#${id}`).toBe(true);
    }
  });
});
