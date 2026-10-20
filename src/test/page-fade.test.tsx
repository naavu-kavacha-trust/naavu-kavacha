import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { PAGE_FADE_SECONDS, PAGE_FADE_START_OPACITY } from "@/lib/page-transition";

// Framer Motion reads the visitor's motion preference once and caches it, so the hook is mocked instead.
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => motion.reduce,
}));

beforeEach(() => {
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  motion.reduce = false;
});

const Shell = ({ start = "/" }: { start?: string }) => (
  <MemoryRouter initialEntries={[start]}>
    <PageLayout>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Home page</h1>
              <Link to="/about">to about</Link>
              <Link to="/#impact">same page, new hash</Link>
            </>
          }
        />
        <Route path="/about" element={<h1>About page</h1>} />
      </Routes>
    </PageLayout>
  </MemoryRouter>
);

const main = () => document.getElementById("main-content") as HTMLElement;
const opacity = () => main().style.opacity;

describe("the fade between pages", () => {
  it("is light: it starts well above zero (so a page never flashes blank) and takes about 150 ms", () => {
    expect(PAGE_FADE_START_OPACITY).toBeGreaterThanOrEqual(0.3);
    expect(PAGE_FADE_START_OPACITY).toBeLessThan(1);
    expect(PAGE_FADE_SECONDS).toBeGreaterThanOrEqual(0.1);
    expect(PAGE_FADE_SECONDS).toBeLessThanOrEqual(0.2);
  });

  it("does not run on the very first load", () => {
    render(<Shell />);
    expect(opacity() === "" || opacity() === "1").toBe(true);
  });

  it("a new page appears inside a fresh <main> that starts at half opacity, never at zero", () => {
    render(<Shell />);
    const before = main();
    fireEvent.click(screen.getByRole("link", { name: "to about" }));
    expect(screen.getByRole("heading", { name: "About page" })).toBeInTheDocument();
    expect(main()).not.toBe(before);
    expect(Number(opacity())).toBe(PAGE_FADE_START_OPACITY);
    expect(Number(opacity())).toBeGreaterThan(0);
  });

  it("the new <main> is still the skip-link target and still takes focus", () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole("link", { name: "to about" }));
    expect(main().id).toBe("main-content");
    expect(main()).toHaveAttribute("tabindex", "-1");
    expect(main()).toHaveFocus();
    expect(document.querySelectorAll("main")).toHaveLength(1);
  });

  it("only changes opacity: nothing moves or resizes", () => {
    render(<Shell />);
    fireEvent.click(screen.getByRole("link", { name: "to about" }));
    const style = main().getAttribute("style") ?? "";
    expect(style).not.toMatch(/transform|translate|height|margin|padding|top|left/);
  });

  it("a #hash change on the same page does not fade or replace <main>", () => {
    render(<Shell />);
    const before = main();
    fireEvent.click(screen.getByRole("link", { name: "same page, new hash" }));
    expect(main()).toBe(before);
    expect(opacity() === "" || opacity() === "1").toBe(true);
  });

  it("is skipped entirely for visitors who prefer reduced motion", () => {
    motion.reduce = true;
    render(<Shell />);
    fireEvent.click(screen.getByRole("link", { name: "to about" }));
    expect(screen.getByRole("heading", { name: "About page" })).toBeInTheDocument();
    expect(opacity() === "" || opacity() === "1").toBe(true);
  });

  it("the navbar and footer are outside the faded area, so they stay solid", () => {
    render(<Shell />);
    expect(main().contains(document.querySelector('nav[aria-label="Main"]'))).toBe(false);
    expect(main().contains(document.querySelector("footer"))).toBe(false);
  });
});
