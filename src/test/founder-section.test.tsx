import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import FounderSection from "@/components/FounderSection";
import type { TeamMember } from "@/data/team";

// Photos come from files that do not exist yet. Pretend only "has-photo" has one.
vi.mock("@/data/team", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/team")>();
  return { ...actual, resolveTeamPhoto: (m: TeamMember) => (m.id === "has-photo" ? "/photos/has-photo.jpg" : null) };
});

afterEach(() => cleanup());

const founder: TeamMember = {
  id: "has-photo",
  group: "founder",
  name: "Test Founder",
  role: "Test Founder Role",
  message: ["First paragraph of the message.", "  Second paragraph.  "],
  quote: "A short supplied quote.",
  social: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/test-founder" },
    { label: "Instagram", url: "https://www.instagram.com/test.founder" },
  ],
  order: 1,
  consent: true,
  note: "SECRET-INTERNAL-NOTE consent received by email",
};

const coFounder: TeamMember = {
  id: "no-photo",
  group: "cofounder",
  name: "Anvitha Rao",
  role: "Lead",
  message: ["Co-founder message."],
  order: 1,
  consent: true,
};

const renderSection = (group: "founder" | "cofounder", members: TeamMember[], tone?: "cream" | "sand") =>
  render(<FounderSection group={group} members={members} tone={tone} />);

describe("each section shows its person", () => {
  it.each([
    ["founder", founder, "Our Founder", "Meet the Founder", "founder"],
    ["cofounder", coFounder, "Our Co-Founder", "Meet the Co-Founder", "cofounder"],
  ] as const)("%s: heading, eyebrow, name, role and message, under their own id", (group, person, heading, eyebrow, id) => {
    const { container } = renderSection(group, [person]);
    expect(container.querySelector("section")!.id).toBe(id);
    expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
    expect(screen.getByText(eyebrow)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: person.name })).toBeInTheDocument();
    expect(screen.getByText(person.role)).toBeInTheDocument();
    expect(screen.getByText(person.message![0].trim())).toBeInTheDocument();
  });

  it("keeps the person's paragraphs as separate paragraphs, trimmed", () => {
    const { container } = renderSection("founder", [founder]);
    const paragraphs = Array.from(container.querySelectorAll(".max-w-prose p")).map((p) => p.textContent);
    expect(paragraphs).toEqual(["First paragraph of the message.", "Second paragraph."]);
  });

  it("shows the photo with alt text '{name}, {role}'", () => {
    renderSection("founder", [founder]);
    const img = screen.getByAltText("Test Founder, Test Founder Role");
    expect(img).toHaveAttribute("src", "/photos/has-photo.jpg");
  });

  it("shows the role exactly as supplied and never adds or changes the word 'Co-Founder'", () => {
    renderSection("cofounder", [coFounder]);
    expect(screen.getByText("Lead")).toBeInTheDocument();
    expect(screen.queryByText("Co-Founder")).toBeNull(); // only the heading "Our Co-Founder" and the eyebrow mention it
    cleanup();
    renderSection("cofounder", [{ ...coFounder, role: "Founder" }]);
    expect(screen.getByText("Founder")).toBeInTheDocument();
  });

  it("never shows the internal note", () => {
    const { container } = renderSection("founder", [founder]);
    expect(container.textContent).not.toContain("SECRET-INTERNAL-NOTE");
  });
});

describe("who is shown", () => {
  it("never shows someone without consent, in either section", () => {
    const hidden = (g: "founder" | "cofounder") => ({ ...(g === "founder" ? founder : coFounder), consent: false });
    for (const g of ["founder", "cofounder"] as const) {
      const { container, unmount } = renderSection(g, [hidden(g)]);
      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByText(hidden(g).name)).toBeNull();
      unmount();
    }
  });

  it("shows only consented people when the list is mixed, and only those of the section's group", () => {
    const list: TeamMember[] = [
      founder,
      { ...founder, id: "hidden", name: "Hidden Person", consent: false },
      coFounder,
      { ...founder, id: "core-person", name: "Core Person", group: "core" },
    ];
    renderSection("founder", list);
    expect(screen.getByText("Test Founder")).toBeInTheDocument();
    for (const absent of ["Hidden Person", "Anvitha Rao", "Core Person"]) expect(screen.queryByText(absent)).toBeNull();
  });

  it("renders nothing at all with nobody in the group", () => {
    for (const g of ["founder", "cofounder"] as const) {
      const { container, unmount } = renderSection(g, []);
      expect(container).toBeEmptyDOMElement();
      unmount();
    }
    // A co-founder alone leaves the Founder section empty, and the other way round.
    expect(renderSection("founder", [coFounder]).container).toBeEmptyDOMElement();
  });

  it("uses plural headings when a group has several people", () => {
    renderSection("founder", [founder, { ...founder, id: "second", name: "Second Founder", order: 2 }]);
    expect(screen.getByRole("heading", { level: 2, name: "Our Founders" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });
});

describe("no photo yet", () => {
  it("shows the person's initials on a brand-coloured avatar, with the name still visible and no image", () => {
    const { container } = renderSection("cofounder", [coFounder]);
    const avatar = screen.getByTestId("initials-avatar");
    expect(avatar).toHaveTextContent("AR");
    expect(avatar).toHaveAttribute("aria-hidden", "true");
    expect(avatar.className).toContain("bg-primary");
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Anvitha Rao" })).toBeInTheDocument();
  });

  it("keeps the 4:5 shape so nothing shifts when a photo is added", () => {
    renderSection("cofounder", [coFounder]);
    expect(screen.getByTestId("initials-avatar").className).toContain("aspect-[4/5]");
  });
});

describe("quote, bio and social links", () => {
  it("shows a pull-quote only when one was supplied", () => {
    const { container, rerender } = renderSection("founder", [founder]);
    expect(container.querySelector("blockquote")).toHaveTextContent("A short supplied quote.");
    rerender(<FounderSection group="founder" members={[{ ...founder, quote: undefined }]} />);
    expect(container.querySelector("blockquote")).toBeNull();
    rerender(<FounderSection group="founder" members={[{ ...founder, quote: "   " }]} />);
    expect(container.querySelector("blockquote")).toBeNull();
  });

  it("falls back to the supplied bio when there is no message, and shows no text block when there is neither", () => {
    const { container, rerender } = renderSection("founder", [{ ...founder, message: undefined, bio: "A supplied bio." }]);
    expect(screen.getByText("A supplied bio.")).toBeInTheDocument();
    rerender(<FounderSection group="founder" members={[{ ...founder, message: undefined, bio: undefined, quote: undefined }]} />);
    expect(container.querySelector(".max-w-prose")).toBeNull();
  });

  it("social links are icon buttons that open safely, with a name for screen readers", () => {
    renderSection("founder", [founder]);
    for (const [label, url] of [
      ["LinkedIn", "https://www.linkedin.com/in/test-founder"],
      ["Instagram", "https://www.instagram.com/test.founder"],
    ]) {
      const link = screen.getByRole("link", { name: `Test Founder on ${label} (opens in a new tab)` });
      expect(link).toHaveAttribute("href", url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.className).toContain("h-11");
      expect(link.className).toContain("w-11");
    }
  });

  it("shows no social links unless supplied, and drops unsafe ones", () => {
    const { container, rerender } = renderSection("founder", [{ ...founder, social: undefined }]);
    expect(within(container).queryAllByRole("link")).toHaveLength(0);
    rerender(
      <FounderSection group="founder" members={[{ ...founder, social: [{ label: "LinkedIn", url: "javascript:alert(1)" }] }]} />,
    );
    expect(within(container).queryAllByRole("link")).toHaveLength(0);
  });
});

describe("layout rhythm", () => {
  const portraitSide = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("article")).map((a) =>
      (a.firstElementChild as HTMLElement).className.includes("md:order-2") ? "right" : "left",
    );

  it("the Founder's portrait starts on the left, the Co-Founder's on the right", () => {
    expect(portraitSide(renderSection("founder", [founder]).container)).toEqual(["left"]);
    cleanup();
    expect(portraitSide(renderSection("cofounder", [coFounder]).container)).toEqual(["right"]);
  });

  it("several people in one group alternate sides", () => {
    const three = [founder, { ...founder, id: "b", name: "B", order: 2 }, { ...founder, id: "c", name: "C", order: 3 }];
    expect(portraitSide(renderSection("founder", three).container)).toEqual(["left", "right", "left"]);
    cleanup();
    const two = [coFounder, { ...coFounder, id: "d", name: "D", order: 2 }];
    expect(portraitSide(renderSection("cofounder", two).container)).toEqual(["right", "left"]);
  });

  it("on phones the portrait comes first (it is first in the page order)", () => {
    const { container } = renderSection("cofounder", [coFounder]);
    const article = container.querySelector("article")!;
    expect(article.firstElementChild!.querySelector("[data-testid='initials-avatar']")).not.toBeNull();
  });

  it("is cream or sand, as told, defaulting to cream for the Founder and sand for the Co-Founder", () => {
    const bg = (c: HTMLElement) => c.querySelector("section")!.className;
    expect(bg(renderSection("founder", [founder]).container)).toContain("bg-background");
    cleanup();
    expect(bg(renderSection("cofounder", [coFounder]).container)).toContain("bg-sand/40");
    cleanup();
    expect(bg(renderSection("founder", [founder], "sand").container)).toContain("bg-sand/40");
    cleanup();
    expect(bg(renderSection("cofounder", [coFounder], "cream").container)).toContain("bg-background");
  });
});
