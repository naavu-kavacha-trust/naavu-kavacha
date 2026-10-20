import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import App from "@/App";
import { PAGE_META } from "@/data/siteConfig";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

const open = (url: string) => {
  window.history.replaceState(null, "", url);
  return render(<App />);
};

describe("opening every page directly", () => {
  it.each([
    ["/about", "About Us", PAGE_META.about.title],
    ["/our-work", "Our Work", PAGE_META.ourWork.title],
    ["/gallery", "Gallery", PAGE_META.gallery.title],
    ["/volunteer", "Volunteer", PAGE_META.volunteer.title],
  ])("%s shows its heading inside the shared shell and sets its tab title", async (url, heading, title) => {
    open(url);
    expect(await screen.findByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
    // The page sets its title in an effect, a moment after the heading appears.
    await waitFor(() => expect(document.title).toBe(title));
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(document.querySelector("footer#contact")).not.toBeNull();
  });

  it("/ shows the home page with the hero as its one h1", async () => {
    open("/");
    const h1s = await screen.findAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Protecting Nature");
  });

  it("an unknown address shows the 404 page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    open("/no-such-page");
    expect(await screen.findByText("Oops! Page not found")).toBeInTheDocument();
  });
});

describe("old single-page links", () => {
  it.each([
    ["/#projects", "/our-work", "#projects"],
    ["/#whatwedo", "/our-work", "#whatwedo"],
    ["/#gallery", "/gallery", "#gallery"],
    ["/#special-moments", "/gallery", "#special-moments"],
    ["/#about", "/about", ""],
    ["/#journey", "/about", "#journey"],
    ["/#future", "/about", "#future"],
    ["/#volunteer", "/volunteer", ""],
    ["/#faq", "/volunteer", "#faq"],
  ])("%s ends up on %s%s", async (start, path, hash) => {
    open(start);
    await waitFor(() => expect(window.location.pathname).toBe(path));
    expect(window.location.hash).toBe(hash);
  });

  it.each(["#home", "#impact", "#contact"])("%s stays on the home page", async (hash) => {
    open(`/${hash}`);
    await screen.findAllByRole("heading", { level: 1 });
    expect(window.location.pathname).toBe("/");
    expect(window.location.hash).toBe(hash);
  });

  it("an old shared activity link opens the same pop-up on the Our Work page", async () => {
    open("/#projects/growing-ganesha");
    await waitFor(() => expect(window.location.pathname).toBe("/our-work"));
    expect(window.location.hash).toBe("#projects/growing-ganesha");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
