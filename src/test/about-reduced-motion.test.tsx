import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CoreTeam from "@/components/CoreTeam";
import FounderSection from "@/components/FounderSection";
import MissionVision from "@/components/MissionVision";
import OurStory from "@/components/OurStory";

// Framer Motion reads the visitor's motion preference once and caches it, so it cannot be flipped between
// tests. These components only ask the useReducedMotion hook, so that is what the test controls.
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => motion.reduce,
}));

afterEach(() => {
  cleanup();
  motion.reduce = false;
});

const story = { story: ["One.", "Two."] };
const people = [
  { id: "p", group: "founder" as const, name: "Test Person", role: "Role", message: ["Words."], order: 1, consent: true },
];
const mission = { story: ["One."], mission: "Mission text.", vision: "Vision text." };

/** Elements the reveal animation has parked invisible, waiting to fade in. */
const parkedInvisible = (root: Element) => Array.from(root.querySelectorAll<HTMLElement>("*")).filter((el) => el.style.opacity === "0");

describe("reveal animations respect reduced motion", () => {
  it("Our Story fades in for most visitors", () => {
    const { container } = render(<OurStory content={story} />);
    expect(parkedInvisible(container).length).toBeGreaterThan(0);
  });

  it("Our Story is simply there (nothing parked invisible, nothing sliding) when reduced motion is preferred", () => {
    motion.reduce = true;
    const { container } = render(<OurStory content={story} />);
    expect(parkedInvisible(container)).toHaveLength(0);
    expect(container.querySelectorAll<HTMLElement>("[style*='translate']")).toHaveLength(0);
  });

  it("Mission & Vision fades in for most visitors, and is simply there with reduced motion", () => {
    const normal = render(<MissionVision content={mission} />);
    expect(parkedInvisible(normal.container).length).toBeGreaterThan(0);
    normal.unmount();

    motion.reduce = true;
    const reduced = render(<MissionVision content={mission} />);
    expect(parkedInvisible(reduced.container)).toHaveLength(0);
  });

  it("Founder and Co-Founder sections fade in for most visitors, and are simply there with reduced motion", () => {
    const normal = render(<FounderSection group="founder" members={people} />);
    expect(parkedInvisible(normal.container).length).toBeGreaterThan(0);
    normal.unmount();

    motion.reduce = true;
    const reduced = render(<FounderSection group="founder" members={people} />);
    expect(parkedInvisible(reduced.container)).toHaveLength(0);
  });

  it("the Core Team grid fades in for most visitors, and is simply there with reduced motion", () => {
    const core = [{ ...people[0], id: "k", group: "core" as const }];
    const show = () => (
      <MemoryRouter>
        <CoreTeam members={core} />
      </MemoryRouter>
    );
    const normal = render(show());
    expect(parkedInvisible(normal.container).length).toBeGreaterThan(0);
    normal.unmount();

    motion.reduce = true;
    const reduced = render(show());
    expect(parkedInvisible(reduced.container)).toHaveLength(0);
  });
});
