import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import AboutSubNav from "@/components/AboutSubNav";
import MissionVision from "@/components/MissionVision";
import Navbar from "@/components/Navbar";
import OurStory from "@/components/OurStory";
import AboutPage from "@/pages/AboutPage";
import { renderPage } from "@/test/test-utils";
import {
  aboutContent,
  getStory,
  getStoryTeaser,
  hasMissionSection,
  missionSectionTitle,
  resolveStoryImage,
  type AboutContent,
} from "@/data/about";
import { getHeadlineStats, formatStat } from "@/data/impact";

beforeEach(() => {
  window.history.replaceState(null, "", "/about");
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

/** The wording the site has always had in "Who We Are". The new story must not change a single claim. */
const ORIGINAL_WHO_WE_ARE =
  "Naavu Kavacha is a group of passionate students striving to make our surroundings a better place to live. " +
  "Our initiative focuses on nurturing the environment and inspiring communities to protect nature through " +
  "education, tree planting, and sustainable practices.";

const base: AboutContent = { story: ["First paragraph.", "Second paragraph."] };

describe("Our Story", () => {
  it("is the existing 'Who We Are' wording, split into paragraphs, with no claim changed", () => {
    expect(getStory().join(" ")).toBe(ORIGINAL_WHO_WE_ARE);
    expect(getStory().length).toBeGreaterThan(1);
  });

  it("renders every paragraph from the data under a large 'Our Story' heading", () => {
    render(<OurStory content={base} />);
    expect(screen.getByRole("heading", { level: 2, name: "Our Story" })).toBeInTheDocument();
    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph.")).toBeInTheDocument();
    expect(document.getElementById("story")).not.toBeNull();
  });

  it("keeps paragraphs at a comfortable reading width", () => {
    const { container } = render(<OurStory content={base} />);
    expect(container.querySelector(".max-w-prose")).not.toBeNull();
  });

  it("drops blank paragraphs, and renders nothing at all with no story", () => {
    const { container, rerender } = render(<OurStory content={{ story: ["Real.", "  ", ""] }} />);
    expect(container.querySelectorAll(".max-w-prose p")).toHaveLength(1);
    rerender(<OurStory content={{ story: ["", "   "] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the two verified headline figures", () => {
    render(<OurStory content={base} />);
    const stats = getHeadlineStats();
    expect(stats).toHaveLength(2);
    for (const s of stats) expect(screen.getByText(formatStat(s))).toBeInTheDocument();
  });

  it("uses the Naavu Kavacha logo until a story photo is supplied", () => {
    render(<OurStory content={base} />);
    expect(screen.getByRole("img", { name: "Naavu Kavacha logo" })).toBeInTheDocument();
  });

  it("uses the supplied story photo and alt text when its file exists", () => {
    const files = { "/src/assets/about/about-story.jpg": "/assets/about-story-abc.jpg" };
    const content = { ...base, storyImage: { file: "about-story.jpg", alt: "Volunteers planting saplings" } };
    expect(resolveStoryImage(content, files)).toEqual({ src: "/assets/about-story-abc.jpg", alt: "Volunteers planting saplings" });
  });

  it("returns no photo when the named file is not in src/assets/about/", () => {
    const content = { ...base, storyImage: { file: "missing.jpg", alt: "x" } };
    expect(resolveStoryImage(content, {})).toBeNull();
    expect(resolveStoryImage(base, { "/src/assets/about/a.jpg": "/a.jpg" })).toBeNull();
  });

  it("the home teaser is the first two paragraphs of the same story", () => {
    expect(getStoryTeaser()).toBe(ORIGINAL_WHO_WE_ARE);
    expect(getStoryTeaser({ story: ["a", "b", "c"] })).toBe("a b");
  });
});

describe("Mission & Vision", () => {
  it("ships empty, so nothing renders and the page has no #mission", () => {
    expect(hasMissionSection(aboutContent)).toBe(false);
    const { container } = render(<MissionVision content={aboutContent} />);
    expect(container).toBeEmptyDOMElement();
    cleanup();
    renderPage(<AboutPage />);
    expect(document.getElementById("mission")).toBeNull();
  });

  it("treats blank text as empty", () => {
    const content = { ...base, mission: "   ", vision: "", values: [{ title: " ", text: "x" }, { title: "y", text: "" }] };
    expect(hasMissionSection(content)).toBe(false);
    const { container } = render(<MissionVision content={content} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows both cards when both are supplied", () => {
    render(<MissionVision content={{ ...base, mission: "Our mission text.", vision: "Our vision text." }} />);
    expect(screen.getByRole("heading", { level: 2, name: "Mission & Vision" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Our Mission" })).toBeInTheDocument();
    expect(screen.getByText("Our mission text.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Our Vision" })).toBeInTheDocument();
    expect(screen.getByText("Our vision text.")).toBeInTheDocument();
    expect(document.getElementById("mission")).not.toBeNull();
  });

  it("shows only the card that has text", () => {
    const { unmount } = render(<MissionVision content={{ ...base, mission: "Only mission." }} />);
    expect(screen.getByText("Only mission.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Our Vision" })).toBeNull();
    unmount();
    render(<MissionVision content={{ ...base, vision: "Only vision." }} />);
    expect(screen.getByText("Only vision.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Our Mission" })).toBeNull();
  });

  it("shows a values grid beneath the cards, only complete values", () => {
    render(
      <MissionVision
        content={{
          ...base,
          mission: "M",
          values: [
            { title: "Care", text: "We look after nature." },
            { title: "Incomplete", text: "" },
          ],
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Our Values" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Care" })).toBeInTheDocument();
    expect(screen.queryByText("Incomplete")).toBeNull();
  });

  it("with only values, the section is called 'Our Values' (not 'Mission & Vision')", () => {
    const content = { ...base, values: [{ title: "Care", text: "We look after nature." }] };
    expect(missionSectionTitle(content)).toBe("Our Values");
    render(<MissionVision content={content} />);
    expect(screen.getByRole("heading", { level: 2, name: "Our Values" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Our Values" })).toBeNull();
  });
});

describe("sub-navigation", () => {
  const sections = (ids: string[]) =>
    ids.map((id) => {
      const el = document.createElement("section");
      el.id = id;
      document.body.appendChild(el);
      return el;
    });
  afterEach(() => document.querySelectorAll("section[id]").forEach((el) => el.remove()));

  const renderNav = (items: { id: string; label: string }[]) =>
    render(
      <MemoryRouter>
        <AboutSubNav items={items} />
      </MemoryRouter>,
    );
  const chips = () => within(screen.getByRole("navigation", { name: "On this page" })).getAllByRole("link");

  it("lists exactly the sections it is given, in order", () => {
    renderNav([
      { id: "story", label: "Our Story" },
      { id: "journey", label: "Journey" },
      { id: "future", label: "Future Plans" },
    ]);
    expect(chips().map((c) => c.textContent)).toEqual(["Our Story", "Journey", "Future Plans"]);
  });

  it("Founder and Co-Founder chips are independent of each other", () => {
    const rest = [
      { id: "story", label: "Our Story" },
      { id: "journey", label: "Journey" },
    ];
    const founderOnly = renderNav([rest[0], { id: "founder", label: "Founder" }, rest[1]]);
    expect(chips().map((c) => c.textContent)).toEqual(["Our Story", "Founder", "Journey"]);
    founderOnly.unmount();
    const coFounderOnly = renderNav([rest[0], { id: "cofounder", label: "Co-Founder" }, rest[1]]);
    expect(chips().map((c) => c.textContent)).toEqual(["Our Story", "Co-Founder", "Journey"]);
    coFounderOnly.unmount();
    renderNav([rest[0], { id: "founder", label: "Founder" }, { id: "cofounder", label: "Co-Founder" }, rest[1]]);
    expect(chips().map((c) => c.textContent)).toEqual(["Our Story", "Founder", "Co-Founder", "Journey"]);
  });

  it("renders nothing when there is nothing to jump between", () => {
    const { container, rerender } = renderNav([{ id: "story", label: "Our Story" }]);
    expect(container).toBeEmptyDOMElement();
    rerender(
      <MemoryRouter>
        <AboutSubNav items={[]} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("a chip scrolls to its section and puts #id in the address", () => {
    const [, journey] = sections(["story", "journey"]);
    renderNav([
      { id: "story", label: "Our Story" },
      { id: "journey", label: "Journey" },
    ]);
    fireEvent.click(screen.getByRole("link", { name: "Journey" }));
    expect((Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances).toContain(journey);
    expect(window.location.pathname).toBe("/about");
    expect(window.location.hash).toBe("#journey");
  });

  it("marks the chip of the section being read as current", async () => {
    let notify: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {};
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: (entries: Partial<IntersectionObserverEntry>[]) => void) {
          notify = cb;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
    const [story, journey] = sections(["story", "journey"]);
    renderNav([
      { id: "story", label: "Our Story" },
      { id: "journey", label: "Journey" },
    ]);
    expect(chips().some((c) => c.hasAttribute("aria-current"))).toBe(false);

    act(() => notify([{ target: story, isIntersecting: true }]));
    await waitFor(() => expect(screen.getByRole("link", { name: "Our Story" })).toHaveAttribute("aria-current", "location"));

    act(() => notify([{ target: story, isIntersecting: false }, { target: journey, isIntersecting: true }]));
    await waitFor(() => expect(screen.getByRole("link", { name: "Journey" })).toHaveAttribute("aria-current", "location"));
    expect(screen.getByRole("link", { name: "Our Story" })).not.toHaveAttribute("aria-current");
  });

  it("is sticky under the navbar, and its chip row scrolls on its own (never the page) with 44px targets", () => {
    renderNav([
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ]);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(nav.className).toContain("sticky");
    expect(nav.className).toContain("top-[var(--navbar-height");
    expect(nav.querySelector("ul")!.className).toContain("overflow-x-auto");
    for (const chip of chips()) expect(chip.className).toContain("min-h-11");
  });
});

describe("the About page", () => {
  it("is hero, then sub-navigation, then Our Story, Founder, Co-Founder, Journey and Future Plans, with one h1", () => {
    const { container } = renderPage(<AboutPage />);
    const main = container.querySelector("main")!;
    expect(main.querySelectorAll("h1")).toHaveLength(1);
    expect(main.firstElementChild?.tagName).toBe("HEADER");
    const wrapper = main.querySelector(".about-page")!;
    expect(wrapper.firstElementChild?.getAttribute("aria-label")).toBe("On this page");
    expect(Array.from(wrapper.querySelectorAll("section[id]")).map((s) => s.id)).toEqual([
      "story",
      "founder",
      "cofounder",
      "journey",
      "future",
    ]);
  });

  it("every sub-navigation link reaches a section that exists", () => {
    const { container } = renderPage(<AboutPage />);
    const nav = within(container.querySelector('nav[aria-label="On this page"]') as HTMLElement);
    const hrefs = nav.getAllByRole("link").map((a) => a.getAttribute("href")!.slice(1));
    expect(hrefs).toEqual(["story", "founder", "cofounder", "journey", "future"]);
    for (const id of hrefs) expect(container.querySelector(`#${id}`), id).not.toBeNull();
  });

  it("has chips for the founder and co-founder (supplied), and none for what has not been supplied yet", () => {
    renderPage(<AboutPage />);
    const labels = within(screen.getByRole("navigation", { name: "On this page" }))
      .getAllByRole("link")
      .map((a) => a.textContent);
    expect(labels).toEqual(["Our Story", "Founder", "Co-Founder", "Journey", "Future Plans"]);
    for (const absent of ["Mission & Vision", "Our Values", "Core Team"]) expect(labels).not.toContain(absent);
  });

  it("anchors clear both the navbar and the sub-navigation", () => {
    const css = readFileSync(resolve(__dirname, "../index.css"), "utf8");
    expect(css).toMatch(/\.about-page section\[id\][^}]*var\(--navbar-height[^}]*var\(--subnav-height/s);
  });
});

describe("navbar height", () => {
  it("is published as --navbar-height so the sub-navigation sits right under the bar", () => {
    document.documentElement.style.removeProperty("--navbar-height");
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 68 });
    try {
      render(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>,
      );
      expect(document.documentElement.style.getPropertyValue("--navbar-height")).toBe("68px");
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, "offsetHeight", original);
    }
  });
});

describe("opening About by address", () => {
  it("the old /#about link lands on /about", async () => {
    window.history.replaceState(null, "", "/#about");
    render(<App />);
    await waitFor(() => expect(window.location.pathname).toBe("/about"));
    expect(await screen.findByRole("heading", { level: 1, name: "About Us" })).toBeInTheDocument();
  });

  it.each(["story", "journey", "future"])("/about#%s scrolls to its section", async (id) => {
    window.history.replaceState(null, "", `/about#${id}`);
    render(<App />);
    await waitFor(() => {
      const target = document.getElementById(id);
      expect(target).not.toBeNull();
      expect((Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances).toContain(target);
    });
  });

  it("/about#mission (not on the page yet) does not break anything", async () => {
    window.history.replaceState(null, "", "/about#mission");
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: "About Us" })).toBeInTheDocument();
  });
});
