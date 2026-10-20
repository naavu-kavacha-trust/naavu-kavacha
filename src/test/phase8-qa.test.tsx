import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import App from "@/App";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

const open = (url: string) => {
  window.history.replaceState(null, "", url);
  return render(<App />);
};

/** Contrast ratio of two hex colours (WCAG 2.x). */
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** HSL ("150 10% 35%") to hex, so the tokens in index.css can be checked against the 4.5:1 rule. */
const hslToHex = (value: string) => {
  const [h, s, l] = value.match(/[\d.]+/g)!.map(Number);
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round((light - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))) * 255);
  };
  return `#${[f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

describe("Phase 8: accessibility fixes", () => {
  const css = readFileSync("src/index.css", "utf8");
  const token = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))![1].trim();

  it("muted text is readable (4.5:1) on every background it is used on: background, muted and sand", () => {
    const text = hslToHex(token("muted-foreground"));
    for (const bg of ["background", "muted", "sand"]) {
      expect(contrast(text, hslToHex(token(bg))), `muted-foreground on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("the 404 page has a main landmark, one h1, a link home, and logs no console error", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    open("/no-such-page");
    expect(await screen.findByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Return to Home" })).toHaveAttribute("href", "/");
    expect(error).not.toHaveBeenCalled();
  });

  it("the footer's 'Quick Links' heading is an h3, so it follows the page's h2 headings without skipping a level", async () => {
    open("/about");
    await screen.findByRole("heading", { level: 1, name: "About Us" });
    expect(screen.getByRole("heading", { name: "Quick Links" }).tagName).toBe("H3");
  });

  it("the footer's links keep a 44px tap area until the desktop breakpoint", () => {
    const source = readFileSync("src/components/Footer.tsx", "utf8");
    expect(source).toMatch(/min-h-11/);
    expect(source).toMatch(/xl:min-h-0/);
    expect(source).not.toMatch(/\smd:min-h-0/);
  });

  it("the Impact labels use at least 90% white on the green band (they were 70%, below 4.5:1)", () => {
    const source = readFileSync("src/components/Impact.tsx", "utf8");
    expect(source).not.toMatch(/text-primary-foreground\/(?:[1-7]\d|\d)(?!\d)/);
    expect(source).toMatch(/text-primary-foreground\/90/);
  });
});
