import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PAGE_META, ROUTES, SITE_URL } from "@/data/siteConfig";
import { createPrefetcher, pageLoaders, prefetcher } from "@/lib/route-chunks";
import { usePageMeta } from "@/hooks/use-page-meta";

const root = resolve(__dirname, "../..");
const indexHtml = readFileSync(resolve(root, "index.html"), "utf8");

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

describe("page titles and descriptions", () => {
  it("every page has its own title and description, none repeated", () => {
    const entries = Object.values(PAGE_META);
    expect(Object.keys(PAGE_META).sort()).toEqual(["about", "gallery", "home", "ourWork", "volunteer"]);
    expect(new Set(entries.map((e) => e.title)).size).toBe(entries.length);
    expect(new Set(entries.map((e) => e.description)).size).toBe(entries.length);
  });

  it("titles stay under 60 characters and descriptions between 50 and 160, so search results do not cut them off", () => {
    for (const [name, meta] of Object.entries(PAGE_META)) {
      expect(meta.title.length, `${name} title`).toBeLessThanOrEqual(60);
      expect(meta.description.length, `${name} description`).toBeGreaterThanOrEqual(50);
      expect(meta.description.length, `${name} description`).toBeLessThanOrEqual(160);
    }
  });

  it("the home page's title and description are exactly the ones in index.html", () => {
    const title = /<title>([^<]*)<\/title>/.exec(indexHtml)![1];
    const description = /<meta name="description" content="([^"]*)"/.exec(indexHtml)![1];
    expect(PAGE_META.home.title).toBe(title);
    expect(PAGE_META.home.description).toBe(description);
  });

  it.each([
    ["/", PAGE_META.home],
    ["/about", PAGE_META.about],
    ["/our-work", PAGE_META.ourWork],
    ["/gallery", PAGE_META.gallery],
    ["/volunteer", PAGE_META.volunteer],
  ])("opening %s sets that page's title and description", async (url, meta) => {
    window.history.replaceState(null, "", url);
    render(<App />);
    await waitFor(() => expect(document.title).toBe(meta.title));
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(meta.description);
  });

  it("moving between pages swaps the title, and coming back home restores the home title", async () => {
    window.history.replaceState(null, "", "/about");
    render(<App />);
    await waitFor(() => expect(document.title).toBe(PAGE_META.about.title));
    const nav = screen.getByRole("navigation", { name: "Main" });
    fireEvent.click(within(nav).getByRole("link", { name: "Gallery" }));
    await waitFor(() => expect(document.title).toBe(PAGE_META.gallery.title));
    fireEvent.click(within(nav).getByRole("link", { name: "Home" }));
    await waitFor(() => expect(document.title).toBe(PAGE_META.home.title));
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(PAGE_META.home.description);
  });
});

describe("social previews", () => {
  it("index.html keeps its site-wide preview image and card settings", () => {
    for (const tag of [
      'property="og:image" content="https://naavu-kavacha.vercel.app/og-image.jpg"',
      'property="og:image:width" content="1200"',
      'property="og:image:height" content="630"',
      'property="og:image:alt"',
      'property="og:title"',
      'property="og:description"',
      'name="twitter:card" content="summary_large_image"',
    ]) {
      expect(indexHtml, tag).toContain(tag);
    }
    expect(existsSync(resolve(root, "public/og-image.jpg"))).toBe(true);
  });

  it("the page-title hook only touches the title and the description, never a preview tag", () => {
    const og = document.createElement("meta");
    og.setAttribute("property", "og:image");
    og.setAttribute("content", "/og-image.jpg");
    document.head.appendChild(og);
    const Page = () => {
      usePageMeta({ title: "T | NAAVU KAVACHA", description: "D".repeat(60) });
      return null;
    };
    const { unmount } = render(<Page />);
    expect(og.getAttribute("content")).toBe("/og-image.jpg");
    unmount();
    expect(og.getAttribute("content")).toBe("/og-image.jpg");
    og.remove();
  });

  it("no code adds a per-page image (the client has not provided any)", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
          if (name !== "test") walk(path);
        } else if (/\.(ts|tsx)$/.test(name) && /["'`](og:image|twitter:image)/.test(readFileSync(path, "utf8"))) hits.push(path);
      }
    };
    walk(resolve(root, "src"));
    expect(hits).toEqual([]);
  });
});

describe("robots.txt and the sitemap", () => {
  const sitemap = async () => (await import(/* @vite-ignore */ pathToFileURL(resolve(root, "scripts/sitemap.mjs")).href)) as {
    parseSiteConfig: (t: string) => { siteUrl: string; routes: string[] };
    buildSitemap: (u: string, r: string[]) => string;
    updateRobots: (t: string, u: string) => string;
    isUsableSiteUrl: (u: string) => boolean;
    run: (root: string) => { written: boolean };
    GENERATED_MARK: string;
  };

  it("robots.txt lets everyone crawl everything", () => {
    const robots = readFileSync(resolve(root, "public/robots.txt"), "utf8");
    expect(robots).toMatch(/User-agent: \*\s+Allow: \//);
    expect(robots).not.toMatch(/^\s*Disallow:\s*\/\s*$/m);
  });

  it("the script reads the same pages and SITE_URL as the app does (so they cannot drift apart)", async () => {
    const { parseSiteConfig } = await sitemap();
    const parsed = parseSiteConfig(readFileSync(resolve(root, "src/data/siteConfig.ts"), "utf8"));
    expect(parsed.routes).toEqual(Object.values(ROUTES));
    expect(parsed.siteUrl).toBe(SITE_URL);
  });

  it("builds a sitemap for the five pages", async () => {
    const { buildSitemap, GENERATED_MARK } = await sitemap();
    const xml = buildSitemap("https://example.org", Object.values(ROUTES));
    expect(xml).toContain(GENERATED_MARK);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.match(/<loc>/g)).toHaveLength(5);
    for (const route of ["/", "/about", "/our-work", "/gallery", "/volunteer"]) {
      expect(xml).toContain(`<loc>https://example.org${route}</loc>`);
    }
  });

  it("escapes anything that would break the XML", async () => {
    const { buildSitemap } = await sitemap();
    expect(buildSitemap("https://example.org/?a=1&b=2", ["/x"])).toContain("&amp;b=2");
  });

  it("only a full web address counts as a usable SITE_URL", async () => {
    const { isUsableSiteUrl } = await sitemap();
    for (const ok of ["https://example.org", "http://localhost:4173", "https://www.example.org/base"]) expect(isUsableSiteUrl(ok)).toBe(true);
    for (const bad of ["", "example.org", "www.example.org", "ftp://x.org", "https://"]) expect(isUsableSiteUrl(bad)).toBe(false);
  });

  it("adds exactly one Sitemap line to robots.txt, replacing an older one", async () => {
    const { updateRobots } = await sitemap();
    const once = updateRobots("User-agent: *\nAllow: /\n", "https://example.org");
    expect(once).toBe("User-agent: *\nAllow: /\n\nSitemap: https://example.org/sitemap.xml\n");
    const twice = updateRobots(once.replace("example.org", "old.example.org"), "https://example.org");
    expect(twice.match(/^Sitemap:/gim)).toHaveLength(1);
    expect(twice).toContain("Sitemap: https://example.org/sitemap.xml");
  });

  describe("running it", () => {
    let dir: string;
    const setup = (siteUrl: string) => {
      dir = mkdtempSync(join(tmpdir(), "sitemap-"));
      mkdirSync(join(dir, "src/data"), { recursive: true });
      mkdirSync(join(dir, "public"));
      writeFileSync(
        join(dir, "src/data/siteConfig.ts"),
        `export const ROUTES = {\n  home: "/",\n  about: "/about",\n  volunteer: "/volunteer",\n} as const;\nexport const SITE_URL = "${siteUrl}";\n`,
      );
      writeFileSync(join(dir, "public/robots.txt"), "User-agent: *\nAllow: /\n");
    };
    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    it("with SITE_URL unset it writes nothing and leaves robots.txt alone", async () => {
      setup("");
      vi.spyOn(console, "log").mockImplementation(() => {});
      const { run } = await sitemap();
      expect(run(dir).written).toBe(false);
      expect(existsSync(join(dir, "public/sitemap.xml"))).toBe(false);
      expect(readFileSync(join(dir, "public/robots.txt"), "utf8")).toBe("User-agent: *\nAllow: /\n");
    });

    it("with SITE_URL set it writes the sitemap and the robots.txt line (a trailing slash is ignored)", async () => {
      setup("https://example.org/");
      vi.spyOn(console, "log").mockImplementation(() => {});
      const { run } = await sitemap();
      expect(run(dir).written).toBe(true);
      const xml = readFileSync(join(dir, "public/sitemap.xml"), "utf8");
      expect(xml.match(/<loc>/g)).toHaveLength(3);
      expect(xml).toContain("<loc>https://example.org/about</loc>");
      expect(xml).not.toContain("example.org//");
      expect(readFileSync(join(dir, "public/robots.txt"), "utf8")).toContain("Sitemap: https://example.org/sitemap.xml");
    });

    it("running it again changes nothing, and unsetting SITE_URL later removes only a generated sitemap", async () => {
      setup("https://example.org");
      vi.spyOn(console, "log").mockImplementation(() => {});
      const { run } = await sitemap();
      run(dir);
      const first = readFileSync(join(dir, "public/robots.txt"), "utf8");
      run(dir);
      expect(readFileSync(join(dir, "public/robots.txt"), "utf8")).toBe(first);

      writeFileSync(join(dir, "src/data/siteConfig.ts"), 'export const ROUTES = { home: "/" } as const;\nexport const SITE_URL = "";\n');
      run(dir);
      expect(existsSync(join(dir, "public/sitemap.xml"))).toBe(false);

      writeFileSync(join(dir, "public/sitemap.xml"), "<urlset>hand-written</urlset>");
      run(dir);
      expect(readFileSync(join(dir, "public/sitemap.xml"), "utf8")).toBe("<urlset>hand-written</urlset>");
    });

    it("a SITE_URL without http(s):// is treated as not set", async () => {
      setup("example.org");
      vi.spyOn(console, "log").mockImplementation(() => {});
      const { run } = await sitemap();
      expect(run(dir).written).toBe(false);
    });
  });

  it("the build runs the script first, and `npm run sitemap` runs it on its own", () => {
    const scripts = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).scripts;
    expect(scripts.prebuild).toBe("node scripts/sitemap.mjs");
    expect(scripts.sitemap).toBe("node scripts/sitemap.mjs");
  });
});

describe("prefetching a page before it is clicked", () => {
  it("loads a page once, however many times it is hovered, focused or touched", () => {
    const about = vi.fn(() => Promise.resolve({}));
    const { prefetch } = createPrefetcher({ "/about": about });
    prefetch("/about");
    prefetch("/about");
    prefetch("/about#journey");
    prefetch("/about?x=1");
    expect(about).toHaveBeenCalledTimes(1);
  });

  it("ignores the home page, in-page jumps and unknown paths", () => {
    const about = vi.fn(() => Promise.resolve({}));
    const { prefetch } = createPrefetcher({ "/about": about });
    for (const href of ["/", "#contact", "/#impact", "/nowhere", "", "https://example.org/about"]) prefetch(href);
    expect(about).not.toHaveBeenCalled();
  });

  it("forgets a failed load so a later hover can try again", async () => {
    const flaky = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({});
    const { prefetch } = createPrefetcher({ "/about": flaky });
    prefetch("/about");
    await Promise.resolve();
    await Promise.resolve();
    prefetch("/about");
    expect(flaky).toHaveBeenCalledTimes(2);
  });

  it("does nothing for visitors who asked their browser to save data", () => {
    const about = vi.fn(() => Promise.resolve({}));
    Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
    try {
      createPrefetcher({ "/about": about }).prefetch("/about");
      expect(about).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(navigator, "connection");
    }
  });

  it("the router and the prefetcher use the same loaders, for exactly the four non-home pages", () => {
    expect(Object.keys(pageLoaders).sort()).toEqual([ROUTES.about, ROUTES.gallery, ROUTES.ourWork, ROUTES.volunteer].sort());
  });

  describe("on the real links", () => {
    const spy = (path: string) => vi.spyOn(pageLoaders, path).mockResolvedValue({ default: () => null });
    beforeEach(() => prefetcher.reset());

    const renderNavbar = () =>
      render(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
      );

    it("hovering a navbar link fetches that page", () => {
      const about = spy("/about");
      renderNavbar();
      fireEvent.mouseEnter(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: "About Us" }));
      expect(about).toHaveBeenCalledTimes(1);
    });

    it("focusing a link with the keyboard does the same, and so does the first touch", () => {
      const gallery = spy("/gallery");
      const work = spy("/our-work");
      renderNavbar();
      const nav = within(screen.getByRole("navigation", { name: "Main" }));
      fireEvent.focus(nav.getByRole("link", { name: "Gallery" }));
      fireEvent.touchStart(nav.getByRole("link", { name: "Our Work" }));
      expect(gallery).toHaveBeenCalledTimes(1);
      expect(work).toHaveBeenCalledTimes(1);
    });

    it("the Volunteer button fetches the Volunteer page", () => {
      const volunteer = spy("/volunteer");
      renderNavbar();
      fireEvent.mouseEnter(within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: "Volunteer" }));
      expect(volunteer).toHaveBeenCalledTimes(1);
    });

    it("Home and Contact fetch nothing", () => {
      const all = Object.keys(pageLoaders).map(spy);
      renderNavbar();
      const nav = within(screen.getByRole("navigation", { name: "Main" }));
      fireEvent.mouseEnter(nav.getByRole("link", { name: "Home" }));
      fireEvent.mouseEnter(nav.getByRole("link", { name: "Contact" }));
      for (const s of all) expect(s).not.toHaveBeenCalled();
    });

    it("links in the mobile menu fetch on touch", async () => {
      const about = spy("/about");
      renderNavbar();
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      const menu = within(await screen.findByRole("dialog"));
      // The menu's scroll lock reads touch coordinates, so a realistic touch carries them.
      const touch = { clientX: 5, clientY: 5 };
      fireEvent.touchStart(menu.getByRole("link", { name: "About Us" }), { touches: [touch], changedTouches: [touch] });
      expect(about).toHaveBeenCalledTimes(1);
    });

    it("footer quick links fetch too", () => {
      const volunteer = spy("/volunteer");
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>,
      );
      fireEvent.mouseEnter(screen.getByRole("link", { name: "FAQ" }));
      expect(volunteer).toHaveBeenCalledTimes(1);
    });
  });
});

describe("code splitting stays in place", () => {
  const sources: { path: string; text: string }[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        if (name !== "test") walk(path);
      } else if (/\.(ts|tsx)$/.test(name)) sources.push({ path, text: readFileSync(path, "utf8") });
    }
  };
  walk(resolve(root, "src"));

  const staticImports = (pattern: RegExp) =>
    sources.filter((s) => s.text.split("\n").some((line) => /^import\s/.test(line) && pattern.test(line))).map((s) => s.path.replace(root, ""));

  it("no page except the home page is imported statically (each is its own chunk)", () => {
    expect(staticImports(/pages\/(About|OurWork|Gallery|Volunteer)Page/)).toEqual([]);
  });

  it("the Lightbox, the activity dialog and the volunteer form are never imported statically", () => {
    expect(staticImports(/components\/(Lightbox|ActivityDialog|VolunteerForm)["']/)).toEqual([]);
    for (const name of ["Lightbox", "ActivityDialog", "VolunteerForm"]) {
      expect(sources.some((s) => new RegExp(`lazy\\(\\(\\) => import\\("@/components/${name}"\\)`).test(s.text)), name).toBe(true);
    }
  });

  it("the animation features load on demand, after the first paint", () => {
    const providers = sources.find((s) => s.path.endsWith("AppProviders.tsx"))!.text;
    expect(providers).toMatch(/import\("@\/lib\/motion-features"\)/);
    expect(staticImports(/motion-features/)).toEqual([]);
  });
});
