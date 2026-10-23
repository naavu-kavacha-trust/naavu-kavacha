import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within, act } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FloatingCTA from "@/components/FloatingCTA";
import PageLayout from "@/components/PageLayout";
import LegacyHashRedirect from "@/components/LegacyHashRedirect";
import { usePageMeta } from "@/hooks/use-page-meta";
import { resolveLegacyHash } from "@/lib/legacy-redirects";
import { LEGACY_HASH_REDIRECTS, NAV_ITEMS, PAGE_META, ROUTES, SITE_URL, isRouteHref } from "@/data/siteConfig";

afterEach(() => cleanup());

/** Shows where the router currently is and how it got there. */
const Probe = () => {
  const { pathname, hash } = useLocation();
  const type = useNavigationType();
  return <p data-testid="where">{`${type}|${pathname}${hash}`}</p>;
};

describe("routes and navigation config", () => {
  it("defines the five pages", () => {
    expect(ROUTES).toEqual({
      home: "/",
      about: "/about",
      ourWork: "/our-work",
      gallery: "/gallery",
      volunteer: "/volunteer",
    });
  });

  it("the nav lists Home, About Us, Our Work, Gallery and Contact (Volunteer is the filled button)", () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual(["Home", "About Us", "Our Work", "Gallery", "Contact"]);
    for (const item of NAV_ITEMS) {
      if (isRouteHref(item.href)) expect(Object.values(ROUTES) as string[]).toContain(item.href);
      else expect(item.href).toBe("#contact");
    }
  });
});

describe("old-link redirect table", () => {
  const rows: [string, string][] = [
    ["#about", "/about"],
    ["#whatwedo", "/our-work#whatwedo"],
    ["#projects", "/our-work#projects"],
    ["#special-moments", "/gallery#special-moments"],
    ["#gallery", "/gallery#gallery"],
    ["#journey", "/about#journey"],
    ["#future", "/about#future"],
    ["#volunteer", "/volunteer"],
    ["#faq", "/volunteer#faq"],
  ];

  it.each(rows)("%s goes to %s", (from, to) => {
    expect(resolveLegacyHash(from)).toBe(to);
  });

  it("covers every row of the agreed table and nothing else", () => {
    expect(Object.keys(LEGACY_HASH_REDIRECTS).sort()).toEqual(rows.map(([from]) => from.slice(1)).sort());
  });

  it.each(["#home", "#impact", "#contact", "#something-else", "", "#"])("%j stays on the home page", (hash) => {
    expect(resolveLegacyHash(hash)).toBeNull();
  });

  it("old shared activity links keep their pop-up: #projects/<id> goes to Our Work with the same hash", () => {
    expect(resolveLegacyHash("#projects/growing-ganesha")).toBe("/our-work#projects/growing-ganesha");
  });

  it("is not fooled by inherited object keys", () => {
    expect(resolveLegacyHash("#constructor")).toBeNull();
    expect(resolveLegacyHash("#toString")).toBeNull();
  });
});

describe("LegacyHashRedirect", () => {
  it.each([
    ["/#projects", "/our-work#projects"],
    ["/#faq", "/volunteer#faq"],
    ["/#about", "/about"],
  ])("opening %s lands on %s, replacing the history entry", async (start, end) => {
    render(
      <MemoryRouter initialEntries={[start]}>
        <LegacyHashRedirect />
        <Probe />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent(`REPLACE|${end}`));
  });

  it("leaves #home, #impact and #contact where they are", () => {
    for (const hash of ["#home", "#impact", "#contact"]) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[`/${hash}`]}>
          <LegacyHashRedirect />
          <Probe />
        </MemoryRouter>,
      );
      expect(screen.getByTestId("where")).toHaveTextContent(`POP|/${hash}`);
      unmount();
    }
  });

  it("does nothing on other pages", () => {
    render(
      <MemoryRouter initialEntries={["/about#journey"]}>
        <LegacyHashRedirect />
        <Probe />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("where")).toHaveTextContent("POP|/about#journey");
  });

  it("applies once, on load: later in-app visits to /#about are not redirected", async () => {
    const GoToOldLink = () => {
      const navigate = useNavigate();
      return <button onClick={() => navigate("/#about")}>go</button>;
    };
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LegacyHashRedirect />
        <GoToOldLink />
        <Probe />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "go" }));
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("PUSH|/#about"));
  });
});

describe("usePageMeta", () => {
  const Page = ({ title, description }: { title: string; description: string }) => {
    usePageMeta({ title, description });
    return null;
  };

  beforeEach(() => {
    document.title = "Original title";
    document.head.querySelectorAll('meta[name="description"]').forEach((m) => m.remove());
  });

  it("sets the title and description, then restores what was there before", () => {
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = "Original description";
    document.head.appendChild(meta);

    const ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    ogTitle.setAttribute("content", "Original Open Graph title");
    document.head.appendChild(ogTitle);
    const ogUrl = document.createElement("meta");
    ogUrl.setAttribute("property", "og:url");
    ogUrl.setAttribute("content", "https://example.org/original");
    document.head.appendChild(ogUrl);

    const { unmount } = render(<Page title="About Us | Naavu Kavacha Trust" description="About copy" />);
    expect(document.title).toBe("About Us | Naavu Kavacha Trust");
    expect(meta.getAttribute("content")).toBe("About copy");
    expect(ogTitle.getAttribute("content")).toBe("About Us | Naavu Kavacha Trust");
    expect(ogUrl.getAttribute("content")).toBe(`${SITE_URL}${window.location.pathname}`);

    unmount();
    expect(document.title).toBe("Original title");
    expect(meta.getAttribute("content")).toBe("Original description");
    expect(ogTitle.getAttribute("content")).toBe("Original Open Graph title");
    expect(ogUrl.getAttribute("content")).toBe("https://example.org/original");
  });

  it("creates the description tag when the document has none, and removes it again afterwards", () => {
    const { unmount } = render(<Page title="T" description="D" />);
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe("D");
    unmount();
    expect(document.querySelector('meta[name="description"]')).toBeNull();
  });

  it("every non-home page title ends with the organization's name", () => {
    for (const [name, meta] of Object.entries(PAGE_META)) {
      if (name === "home") continue; // the home title is the one in index.html (checked in phase7-polish.test.tsx)
      expect(meta.title).toMatch(/^[^|]+ \| (?:NAAVU KAVACHA|Naavu Kavacha Trust)$/);
      expect(meta.description.length).toBeGreaterThan(30);
    }
  });
});

describe("navbar", () => {
  const renderAt = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Navbar />
      </MemoryRouter>,
    );
  const desktop = () => screen.getByRole("navigation", { name: "Main" });

  it.each([
    ["/", "Home"],
    ["/about", "About Us"],
    ["/our-work", "Our Work"],
    ["/gallery", "Gallery"],
  ])("on %s only '%s' is marked as the current page", (path, label) => {
    renderAt(path);
    const current = within(desktop())
      .getAllByRole("link")
      .filter((a) => a.getAttribute("aria-current") === "page")
      .map((a) => a.textContent);
    expect(current).toEqual([label]);
  });

  it("has a filled Volunteer button that opens /volunteer, and marks it current on that page", () => {
    renderAt("/about");
    const button = within(desktop()).getByRole("link", { name: "Volunteer" });
    expect(button).toHaveAttribute("href", "/volunteer");
    expect(button.className).toContain("bg-primary");
    expect(button).not.toHaveAttribute("aria-current");
    cleanup();

    renderAt("/volunteer");
    expect(within(desktop()).getByRole("link", { name: "Volunteer" })).toHaveAttribute("aria-current", "page");
    // No ordinary nav item is current on the Volunteer page.
    expect(
      within(desktop())
        .getAllByRole("link")
        .filter((a) => a.getAttribute("aria-current") === "page")
        .map((a) => a.textContent),
    ).toEqual(["Volunteer"]);
  });

  it("is see-through over the hero on the home page, and solid from the start on every other page", () => {
    renderAt("/");
    expect(desktop().className).toContain("bg-transparent");
    cleanup();
    for (const path of ["/about", "/our-work", "/gallery", "/volunteer"]) {
      renderAt(path);
      expect(desktop().className, path).not.toContain("bg-transparent");
      expect(desktop().className, path).toContain("bg-background");
      cleanup();
    }
  });

  it("the Volunteer button text keeps at least 4.5:1 contrast in its resting and hover states", () => {
    // Colours from src/index.css: text cream on --primary. Hover must not drop to the lighter forest-light.
    renderAt("/");
    const cls = within(desktop()).getByRole("link", { name: "Volunteer" }).className;
    expect(cls).toContain("text-primary-foreground");
    expect(cls).toContain("hover:bg-primary/90");
    expect(cls).not.toContain("forest-light");
  });

  it("the brand link goes home", () => {
    renderAt("/about");
    expect(within(desktop()).getByRole("link", { name: /naavu kavacha/i })).toHaveAttribute("href", "/");
  });
});

describe("floating volunteer button", () => {
  const setScroll = (y: number) => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true, writable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
  };
  afterEach(() => setScroll(0));

  const renderAt = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <FloatingCTA />
      </MemoryRouter>,
    );

  it("appears on other pages once the visitor has scrolled, and opens /volunteer", async () => {
    renderAt("/about");
    expect(screen.queryByRole("link", { name: "Become a Volunteer" })).toBeNull();
    setScroll(600);
    expect(await screen.findByRole("link", { name: "Become a Volunteer" })).toHaveAttribute("href", "/volunteer");
  });

  it("never shows on the Volunteer page", () => {
    setScroll(600);
    renderAt("/volunteer");
    expect(screen.queryByRole("link", { name: "Become a Volunteer" })).toBeNull();
  });
});

describe("moving between pages", () => {
  const Shell = () => (
    <PageLayout>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Home page</h1>
              <Link to="/about">to about</Link>
              <Link to="/about#journey">to journey</Link>
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <h1>About page</h1>
              <section id="journey">Journey</section>
            </>
          }
        />
      </Routes>
    </PageLayout>
  );

  beforeEach(() => {
    window.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("does not move the page or the focus on the very first load", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Shell />
      </MemoryRouter>,
    );
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(document.getElementById("main-content")).not.toHaveFocus();
  });

  it("scrolls to the top and focuses <main> after opening a page without a hash", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Shell />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("link", { name: "to about" }));
    await screen.findByRole("heading", { name: "About page" });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
    expect(document.getElementById("main-content")).toHaveFocus();
  });

  it("scrolls to the element when the new page is opened with a hash", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Shell />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("link", { name: "to journey" }));
    const journey = await screen.findByText("Journey");
    await waitFor(() =>
      expect((Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances).toContain(journey),
    );
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("keeps the same shell mounted: skip link, one navbar, one main, one footer", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/about"]}>
        <Shell />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content");
    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.querySelectorAll("footer#contact")).toHaveLength(1);
    expect(screen.getAllByRole("navigation", { name: "Main" })).toHaveLength(1);
  });
});
