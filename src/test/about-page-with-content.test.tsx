import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { renderPage } from "@/test/test-utils";
import AboutPage from "@/pages/AboutPage";

// The shipped data has no mission, vision or values yet. Here the team "has supplied" them, to prove that
// the page, its sub-navigation and its anchors all pick them up.
vi.mock("@/data/about", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/about")>();
  return {
    ...actual,
    aboutContent: {
      ...actual.aboutContent,
      mission: "Mission supplied by the team.",
      vision: "Vision supplied by the team.",
      values: [{ title: "Care", text: "We look after nature." }],
    },
  };
});

beforeEach(() => {
  window.history.replaceState(null, "", "/about");
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("About page once mission, vision and values are supplied", () => {
  it("shows the section between Our Story and the Journey", () => {
    const { container } = renderPage(<AboutPage />);
    const ids = Array.from(container.querySelectorAll(".about-page section[id]")).map((s) => s.id);
    expect(ids).toEqual(["story", "mission", "founder", "cofounder", "journey", "future"]);
    expect(screen.getByText("Mission supplied by the team.")).toBeInTheDocument();
    expect(screen.getByText("Vision supplied by the team.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Care" })).toBeInTheDocument();
  });

  it("adds a 'Mission & Vision' chip in the right place, and every chip reaches its section", () => {
    const { container } = renderPage(<AboutPage />);
    const nav = within(container.querySelector('nav[aria-label="On this page"]') as HTMLElement);
    const chips = nav.getAllByRole("link");
    expect(chips.map((c) => c.textContent)).toEqual([
      "Our Story",
      "Mission & Vision",
      "Founder",
      "Co-Founder",
      "Journey",
      "Future Plans",
    ]);
    for (const chip of chips) {
      const id = chip.getAttribute("href")!.slice(1);
      const target = container.querySelector(`#${id}`);
      expect(target, id).not.toBeNull();
      fireEvent.click(chip);
      expect((Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances).toContain(target);
    }
  });
});
