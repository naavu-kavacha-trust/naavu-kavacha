import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "@/App";
import AboutPage from "@/pages/AboutPage";
import { renderPage } from "@/test/test-utils";
import type { TeamMember } from "@/data/team";

// The site ships with nobody in the team list. These tests put fixture people in, in every combination.
const fixtures = vi.hoisted(() => ({
  members: [] as unknown[],
  about: { story: ["One story paragraph."], mission: undefined as string | undefined, vision: undefined as string | undefined, values: [] as unknown[] },
}));

vi.mock("@/data/team", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/team")>();
  const members = () => fixtures.members as TeamMember[];
  return {
    ...actual,
    getFounders: () => actual.selectTeam(members(), "founder"),
    getCoFounders: () => actual.selectTeam(members(), "cofounder"),
    getCoreTeam: () => actual.selectTeam(members(), "core"),
    resolveTeamPhoto: () => null,
  };
});
vi.mock("@/data/about", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/about")>();
  return { ...actual, aboutContent: fixtures.about };
});

const founder: TeamMember = { id: "f", group: "founder", name: "Fixture Founder", role: "Role F", message: ["Founder words."], order: 1, consent: true };
const core1: TeamMember = { id: "k1", group: "core", name: "Core One", role: "Role K1", order: 1, consent: true };
const core2: TeamMember = { id: "k2", group: "core", name: "Core Two", role: "Role K2", bio: "Core two bio.", order: 2, consent: true };
const coFounder: TeamMember = { id: "c", group: "cofounder", name: "Fixture CoFounder", role: "Role C", message: ["Co-founder words."], order: 1, consent: true };

beforeEach(() => {
  fixtures.members = [];
  fixtures.about.mission = undefined;
  fixtures.about.vision = undefined;
  window.history.replaceState(null, "", "/about");
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

const ids = (c: HTMLElement) => Array.from(c.querySelectorAll(".about-page section[id]")).map((s) => s.id);
const chips = (c: HTMLElement) =>
  within(c.querySelector('nav[aria-label="On this page"]') as HTMLElement)
    .getAllByRole("link")
    .map((a) => a.textContent);
const bg = (c: HTMLElement, id: string) => c.querySelector(`#${id}`)!.className;
const side = (c: HTMLElement, id: string) =>
  (c.querySelector(`#${id} article`)!.firstElementChild as HTMLElement).className.includes("md:order-2") ? "right" : "left";

describe("About page with nobody in the team list (as shipped)", () => {
  it("has no Founder or Co-Founder section and no such chips", () => {
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "journey", "future"]);
    expect(chips(container)).toEqual(["Our Story", "Journey", "Future Plans"]);
  });

  it("people without consent do not count: no section, no chip", () => {
    fixtures.members = [{ ...founder, consent: false }, { ...coFounder, consent: false }];
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "journey", "future"]);
    expect(screen.queryByText("Fixture Founder")).toBeNull();
  });
});

describe("Founder and Co-Founder are independent", () => {
  it("only a founder: Founder section and chip appear, Co-Founder does not", () => {
    fixtures.members = [founder];
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "founder", "journey", "future"]);
    expect(chips(container)).toEqual(["Our Story", "Founder", "Journey", "Future Plans"]);
  });

  it("only a co-founder: Co-Founder section and chip appear, Founder does not", () => {
    fixtures.members = [coFounder];
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "cofounder", "journey", "future"]);
    expect(chips(container)).toEqual(["Our Story", "Co-Founder", "Journey", "Future Plans"]);
  });

  it("both: Founder comes before Co-Founder in the page, the sub-navigation and the DOM, with distinct ids", () => {
    fixtures.members = [coFounder, founder]; // list order must not matter
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "founder", "cofounder", "journey", "future"]);
    expect(chips(container)).toEqual(["Our Story", "Founder", "Co-Founder", "Journey", "Future Plans"]);
    const founderEl = container.querySelector("#founder")!;
    const coFounderEl = container.querySelector("#cofounder")!;
    expect(founderEl).not.toBe(coFounderEl);
    expect(founderEl.compareDocumentPosition(coFounderEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelectorAll("[id]")).toHaveLength(new Set(Array.from(container.querySelectorAll("[id]")).map((e) => e.id)).size);
  });

  it("with several people the chip is plural", () => {
    fixtures.members = [founder, { ...founder, id: "f2", name: "Second", order: 2 }];
    const { container } = renderPage(<AboutPage />);
    expect(chips(container)).toContain("Founders");
  });
});

describe("rhythm across the page", () => {
  it("the two sections have opposite backgrounds and mirrored portraits", () => {
    fixtures.members = [founder, coFounder];
    const { container } = renderPage(<AboutPage />);
    expect(bg(container, "founder")).not.toBe(bg(container, "cofounder"));
    expect(side(container, "founder")).toBe("left");
    expect(side(container, "cofounder")).toBe("right");
  });

  it("without Mission & Vision: Our Story is cream, so the Founder is sand and the Co-Founder cream", () => {
    fixtures.members = [founder, coFounder];
    const { container } = renderPage(<AboutPage />);
    expect(bg(container, "story")).toContain("bg-background");
    expect(bg(container, "founder")).toContain("bg-sand/40");
    expect(bg(container, "cofounder")).toContain("bg-background");
  });

  it("with Mission & Vision (always sand): the Founder is cream and the Co-Founder sand, so the page keeps alternating", () => {
    fixtures.about.mission = "Mission supplied.";
    fixtures.members = [founder, coFounder];
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "mission", "founder", "cofounder", "journey", "future"]);
    expect(bg(container, "mission")).toContain("bg-sand/40");
    expect(bg(container, "founder")).toContain("bg-background");
    expect(bg(container, "cofounder")).toContain("bg-sand/40");
  });

  it("a lone co-founder still alternates with what is before it", () => {
    fixtures.members = [coFounder];
    const { container } = renderPage(<AboutPage />);
    expect(bg(container, "story")).toContain("bg-background");
    expect(bg(container, "cofounder")).toContain("bg-sand/40");
  });
});

describe("links reach the sections", () => {
  it("every chip scrolls to a section that exists", () => {
    fixtures.members = [founder, coFounder];
    const { container } = renderPage(<AboutPage />);
    const nav = within(container.querySelector('nav[aria-label="On this page"]') as HTMLElement);
    for (const chip of nav.getAllByRole("link")) {
      const id = chip.getAttribute("href")!.slice(1);
      const target = container.querySelector(`#${id}`);
      expect(target, id).not.toBeNull();
      fireEvent.click(chip);
      expect((Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances).toContain(target);
    }
  });

  it.each(["founder", "cofounder"])("/about#%s opens the page scrolled to that section", async (id) => {
    fixtures.members = [founder, coFounder];
    window.history.replaceState(null, "", `/about#${id}`);
    render(<App />);
    await waitFor(() => {
      const target = document.getElementById(id);
      expect(target).not.toBeNull();
      expect((Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances).toContain(target);
    });
  });

  it("a link to a section that is not there (no co-founder yet) opens the page without trouble", async () => {
    window.history.replaceState(null, "", "/about#cofounder");
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: "About Us" })).toBeInTheDocument();
  });
});

describe("Core Team on the About page", () => {
  it("only a core team: the section and the 'Core Team' chip appear, nothing else is added", () => {
    fixtures.members = [core1, core2];
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "team", "journey", "future"]);
    expect(chips(container)).toEqual(["Our Story", "Core Team", "Journey", "Future Plans"]);
  });

  it("all three groups: Founder, Co-Founder, then Core Team, each in the page, the chips and the DOM", () => {
    fixtures.members = [core1, coFounder, founder];
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "founder", "cofounder", "team", "journey", "future"]);
    expect(chips(container)).toEqual(["Our Story", "Founder", "Co-Founder", "Core Team", "Journey", "Future Plans"]);
    // The founder and co-founder are not repeated in the grid.
    const grid = container.querySelector("#team")!;
    expect(within(grid as HTMLElement).queryByText("Fixture Founder")).toBeNull();
    expect(within(grid as HTMLElement).queryByText("Fixture CoFounder")).toBeNull();
    expect(within(grid as HTMLElement).getByText("Core One")).toBeInTheDocument();
  });

  it("a founder placed in the core group by mistake still shows once, in the core grid only", () => {
    fixtures.members = [{ ...founder, id: "dup", group: "core" }];
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "team", "journey", "future"]);
    expect(screen.getAllByText("Fixture Founder")).toHaveLength(1);
  });

  it("people without consent never create a Core Team section or chip", () => {
    fixtures.members = [{ ...core1, consent: false }];
    const { container } = renderPage(<AboutPage />);
    expect(ids(container)).toEqual(["story", "journey", "future"]);
    expect(screen.queryByText("Core One")).toBeNull();
  });

  it("keeps alternating cream and sand all the way down", () => {
    fixtures.members = [founder, coFounder, core1];
    const { container } = renderPage(<AboutPage />);
    expect([bg(container, "story"), bg(container, "founder"), bg(container, "cofounder"), bg(container, "team")].map((c) => (c.includes("bg-sand/40") ? "sand" : "cream"))).toEqual([
      "cream",
      "sand",
      "cream",
      "sand",
    ]);
    cleanup();
    fixtures.about.mission = "Mission supplied.";
    const withMission = renderPage(<AboutPage />);
    expect(["story", "mission", "founder", "cofounder", "team"].map((id) => (bg(withMission.container, id).includes("bg-sand/40") ? "sand" : "cream"))).toEqual([
      "cream",
      "sand",
      "cream",
      "sand",
      "cream",
    ]);
  });

  it("the Core Team chip and /about#team reach the section", async () => {
    fixtures.members = [core1];
    const { container } = renderPage(<AboutPage />);
    fireEvent.click(within(container.querySelector('nav[aria-label="On this page"]') as HTMLElement).getByRole("link", { name: "Core Team" }));
    expect((Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances).toContain(container.querySelector("#team"));
    cleanup();
    window.history.replaceState(null, "", "/about#team");
    render(<App />);
    await waitFor(() => {
      const target = document.getElementById("team");
      expect(target).not.toBeNull();
      expect((Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances).toContain(target);
    });
  });
});
