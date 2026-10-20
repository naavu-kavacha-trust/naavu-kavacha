import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "@/App";

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

/** Opens the whole app at a URL, as if the visitor had typed it. */
const open = (url: string) => {
  window.history.replaceState(null, "", url);
  return render(<App />);
};

const main = () => document.getElementById("main-content")!;
const sectionIds = () => Array.from(main().querySelectorAll("section[id]")).map((s) => s.id);

describe("page contents and order", () => {
  it.each([
    ["/about", "About Us", ["story", "founder", "cofounder", "journey", "future"]],
    ["/our-work", "Our Work", ["whatwedo", "projects"]],
    ["/gallery", "Gallery", ["special-moments", "gallery"]],
    ["/volunteer", "Volunteer", ["volunteer", "faq"]],
  ])("%s: banner with the page's one h1, then its sections in order", async (url, title, ids) => {
    open(url);
    await screen.findByRole("heading", { level: 1, name: title });
    // Wait for the last section: sections arrive in the same render, so the full list is stable by now.
    await waitFor(() => expect(sectionIds()).toEqual(ids));
    expect(within(main()).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    // The banner comes first inside <main>.
    expect(main().firstElementChild?.tagName).toBe("HEADER");
  });

  it("the banner has a breadcrumb: a link home, then the current page", async () => {
    open("/our-work");
    const crumbs = await screen.findByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    const current = crumbs.querySelector('[aria-current="page"]');
    expect(current).toHaveTextContent("Our Work");
  });

  it.each([["/about"], ["/our-work"], ["/gallery"], ["/volunteer"]])(
    "%s: headings never skip a level (h1, then h2, then h3)",
    async (url) => {
      open(url);
      await screen.findByRole("heading", { level: 1 });
      await waitFor(() => expect(sectionIds().length).toBeGreaterThan(1));
      const levels = Array.from(main().querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => Number(h.tagName[1]));
      expect(levels[0]).toBe(1);
      levels.forEach((level, i) => {
        if (i > 0) expect(level, `heading ${i} follows level ${levels[i - 1]}`).toBeLessThanOrEqual(levels[i - 1] + 1);
      });
    },
  );

  it.each([["/about"], ["/our-work"], ["/gallery"]])("%s ends with a way to volunteer", async (url) => {
    open(url);
    await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(sectionIds().length).toBeGreaterThan(1));
    const sections = main().querySelectorAll("section[id]");
    const last = sections[sections.length - 1];
    expect(last.querySelector('a[href="/volunteer"]')).not.toBeNull();
  });

  it("the Volunteer page does not end with a button that links to itself", async () => {
    open("/volunteer");
    await screen.findByRole("heading", { level: 1, name: "Volunteer" });
    const faq = await waitFor(() => {
      const el = document.getElementById("faq");
      expect(el).not.toBeNull();
      return el!;
    });
    expect(faq.querySelector('a[href="/volunteer"]')).toBeNull();
    // The questions themselves moved with it.
    expect(within(faq).getAllByRole("button").length).toBeGreaterThanOrEqual(8);
  });

  it("the home page no longer carries the FAQ (it lives on the Volunteer page)", async () => {
    open("/");
    await screen.findAllByRole("heading", { level: 1 });
    expect(document.getElementById("faq")).toBeNull();
  });
});

describe("deep links land on the right element", () => {
  it.each([
    ["/volunteer#faq", "faq"],
    ["/about#journey", "journey"],
    ["/about#future", "future"],
    ["/our-work#whatwedo", "whatwedo"],
    ["/our-work#projects", "projects"],
    ["/gallery#special-moments", "special-moments"],
    ["/gallery#gallery", "gallery"],
  ])("%s scrolls to #%s", async (url, id) => {
    open(url);
    await waitFor(() => {
      const target = document.getElementById(id);
      expect(target, `#${id} exists`).not.toBeNull();
      const scrolled = (Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances;
      expect(scrolled).toContain(target);
    });
  });

  it("every section a page keeps has scroll clearance for the fixed navbar", () => {
    // The solid navbar is about 70px tall; section[id] gets 5rem (80px) in src/index.css.
    // jsdom has no stylesheet, so read the rule from the source.
    const css = readFileSync(resolve(__dirname, "../index.css"), "utf8");
    expect(css).toMatch(/section\[id\][^}]*scroll-margin-top:\s*5rem/s);
  });
});

describe("working features on their new pages", () => {
  it("an activity card on /our-work opens its pop-up and a shareable URL", async () => {
    open("/our-work");
    await screen.findByRole("heading", { level: 1, name: "Our Work" });
    const card = await waitFor(() => {
      const el = document.querySelector<HTMLElement>("#projects button[aria-haspopup=dialog]");
      expect(el).not.toBeNull();
      return el!;
    });
    fireEvent.click(card);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/our-work");
    expect(window.location.hash).toMatch(/^#projects\/.+/);
  });

  it("'Volunteer for this activity' lands on /volunteer with that interest already ticked", async () => {
    open("/our-work");
    fireEvent.click(await screen.findByRole("button", { name: "See Clean-Up Drives" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /volunteer for this activity/i }));

    await waitFor(() => expect(window.location.pathname).toBe("/volunteer"));
    await screen.findByRole("heading", { level: 1, name: "Volunteer" });
    const box = await screen.findByRole("checkbox", { name: "Clean-Up drives" });
    expect(box.getAttribute("data-state")).toBe("checked");
  });

  it("'Join the next drive' on /our-work lands on /volunteer with the same interest ticked", async () => {
    open("/our-work");
    fireEvent.click(await screen.findByRole("link", { name: "Join the next drive" }));
    await waitFor(() => expect(window.location.pathname).toBe("/volunteer"));
    const box = await screen.findByRole("checkbox", { name: "Clean-Up drives" });
    expect(box.getAttribute("data-state")).toBe("checked");
  });

  it("a photo on /gallery opens the full-screen viewer", async () => {
    open("/gallery");
    await screen.findByRole("heading", { level: 1, name: "Gallery" });
    const thumbs = await screen.findAllByRole("button", { name: /^Open photo/ });
    fireEvent.click(thumbs[0]);
    const viewer = await screen.findByRole("dialog");
    expect(within(viewer).getByText(new RegExp(`^1 / ${thumbs.length}$`))).toBeInTheDocument();
  });

  it("moving from Our Work to Gallery through the navbar shows the new page and scrolls to the top", async () => {
    open("/our-work");
    await screen.findByRole("heading", { level: 1, name: "Our Work" });
    const nav = screen.getByRole("navigation", { name: "Main" });
    fireEvent.click(within(nav).getByRole("link", { name: "Gallery" }));
    await screen.findByRole("heading", { level: 1, name: "Gallery" });
    await waitFor(() => expect(document.title).toBe("Gallery | NAAVU KAVACHA"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
    expect(within(nav).getByRole("link", { name: "Gallery" })).toHaveAttribute("aria-current", "page");
  });
});
