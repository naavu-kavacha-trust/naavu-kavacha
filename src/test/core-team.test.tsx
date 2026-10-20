import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CoreTeam from "@/components/CoreTeam";
import type { TeamMember } from "@/data/team";

// Photos come from files that do not exist yet. Pretend only "with-photo" has one.
vi.mock("@/data/team", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/team")>();
  return { ...actual, resolveTeamPhoto: (m: TeamMember) => (m.id === "with-photo" ? "/photos/with-photo.jpg" : null) };
});

afterEach(() => cleanup());

const member = (over: Partial<TeamMember>): TeamMember => ({
  id: "m",
  group: "core",
  name: "Member",
  role: "Role",
  order: 1,
  consent: true,
  ...over,
});

const plain = member({ id: "plain", name: "Plain Person", role: "Seed Collector", order: 1 });
const withBio = member({ id: "with-bio", name: "Bio Person", role: "Coordinator", bio: "A supplied bio about Bio Person.", order: 2 });
const socialOnly = member({
  id: "social-only",
  name: "Social Person",
  role: "Designer",
  social: [{ label: "Instagram", url: "https://www.instagram.com/social.person" }],
  order: 3,
});
const withPhoto = member({ id: "with-photo", name: "Photo Person", role: "Photographer", bio: "Bio with photo.", order: 4 });

const renderTeam = (members: TeamMember[], tone?: "cream" | "sand") =>
  render(
    <MemoryRouter>
      <CoreTeam members={members} tone={tone} />
    </MemoryRouter>,
  );

const names = (c: HTMLElement) =>
  Array.from(c.querySelectorAll("ul > li")).map((li) => li.querySelector("span.block.font-display")!.textContent);

describe("the grid", () => {
  it("shows the consented core members, in `order`, under id 'team' and the heading 'Core Team'", () => {
    const { container } = renderTeam([withPhoto, socialOnly, plain, withBio]);
    expect(container.querySelector("section")!.id).toBe("team");
    expect(screen.getByRole("heading", { level: 2, name: "Core Team" })).toBeInTheDocument();
    expect(names(container)).toEqual(["Plain Person", "Bio Person", "Social Person", "Photo Person"]);
  });

  it("is 2 columns on phones, 3 on tablets, 4 on desktop", () => {
    const { container } = renderTeam([plain, withBio]);
    const cls = container.querySelector("ul")!.className;
    expect(cls).toContain("grid-cols-2");
    expect(cls).toContain("md:grid-cols-3");
    expect(cls).toContain("lg:grid-cols-4");
  });

  it("every card has the same fixed 4:5 photo frame, with or without a picture", () => {
    const { container } = renderTeam([plain, withPhoto]);
    const frames = Array.from(container.querySelectorAll("li")).map((li) => li.querySelector("[class*='aspect-[4/5]']"));
    expect(frames).toHaveLength(2);
    for (const f of frames) expect(f).not.toBeNull();
  });

  it("leaves out people without consent, and anyone from another group (a founder or co-founder never appears here)", () => {
    const list = [
      plain,
      member({ id: "no-consent", name: "No Consent", consent: false, order: 2 }),
      member({ id: "the-founder", name: "The Founder", group: "founder", order: 3 }),
      member({ id: "the-cofounder", name: "The Cofounder", group: "cofounder", order: 4 }),
    ];
    const { container } = renderTeam(list);
    expect(names(container)).toEqual(["Plain Person"]);
    for (const absent of ["No Consent", "The Founder", "The Cofounder"]) expect(screen.queryByText(absent)).toBeNull();
  });

  it("renders nothing at all with no consented members", () => {
    expect(renderTeam([]).container).toBeEmptyDOMElement();
    cleanup();
    expect(renderTeam([member({ consent: false })]).container).toBeEmptyDOMElement();
    cleanup();
    expect(renderTeam([member({ group: "founder" })]).container).toBeEmptyDOMElement();
  });

  it("keeps one grid however long the list is: no pagination, no 'load more'", () => {
    const many = Array.from({ length: 20 }, (_, i) => member({ id: `p${i}`, name: `Person ${i + 1}`, order: i + 1 }));
    const { container } = renderTeam(many);
    expect(container.querySelectorAll("ul > li")).toHaveLength(20);
    expect(screen.queryByRole("button", { name: /next|more|page/i })).toBeNull();
  });

  it("never overflows its cell: long names and roles wrap", () => {
    const { container } = renderTeam([member({ name: "A".repeat(60), role: "B".repeat(80) })]);
    expect(container.querySelector("li")!.className).toContain("min-w-0");
    for (const span of container.querySelectorAll("li span.block")) expect(span.className).toContain("break-words");
  });

  it("alternates the background as told (cream or sand)", () => {
    expect(renderTeam([plain]).container.querySelector("section")!.className).toContain("bg-background");
    cleanup();
    expect(renderTeam([plain], "sand").container.querySelector("section")!.className).toContain("bg-sand/40");
  });
});

describe("photo or initials", () => {
  it("shows an initials avatar when there is no photo, with the name still visible", () => {
    const { container } = renderTeam([plain]);
    expect(screen.getByTestId("initials-avatar")).toHaveTextContent("PP");
    expect(screen.getByTestId("initials-avatar")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Plain Person")).toBeInTheDocument();
  });

  it("shows the photo when there is one (decorative in the card, since the name is written beside it)", () => {
    const { container } = renderTeam([withPhoto]);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/photos/with-photo.jpg");
    expect(img).toHaveAttribute("alt", "");
    expect(screen.queryByTestId("initials-avatar")).toBeNull();
  });
});

describe("plain cards and clickable cards", () => {
  it("a member with no bio and no links is plain: not a button, not focusable", () => {
    const { container } = renderTeam([plain]);
    const li = container.querySelector("li")!;
    expect(within(li).queryByRole("button")).toBeNull();
    expect(li.querySelector("[tabindex], a, button")).toBeNull();
    expect(li).not.toHaveAttribute("aria-haspopup");
  });

  it("a member with a bio, or a social link, is a button that opens a dialog", () => {
    renderTeam([plain, withBio, socialOnly]);
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual([
      expect.stringContaining("Bio Person"),
      expect.stringContaining("Social Person"),
    ]);
    for (const b of buttons) {
      expect(b.tagName).toBe("BUTTON"); // a real button: Tab reaches it, Enter and Space activate it
      expect(b).toHaveAttribute("type", "button");
      expect(b).toHaveAttribute("aria-haspopup", "dialog");
    }
  });

  it("never nests an interactive element inside another", () => {
    const { container } = renderTeam([plain, withBio, socialOnly, withPhoto]);
    for (const b of container.querySelectorAll("li button")) {
      expect(b.querySelector("a, button, input, select, textarea, [tabindex], [role='button']")).toBeNull();
    }
  });

  it("a social link that is not https does not make a card clickable", () => {
    renderTeam([member({ social: [{ label: "LinkedIn", url: "javascript:alert(1)" }] })]);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("the dialog", () => {
  const openCard = (name: string) => {
    const card = screen.getByRole("button", { name: new RegExp(name) });
    fireEvent.click(card);
    return card;
  };

  it("opens as an accessible dialog named after the person, with role and bio", async () => {
    renderTeam([withBio]);
    openCard("Bio Person");
    const dialog = await screen.findByRole("dialog", { name: "Bio Person" });
    expect(within(dialog).getByText("Coordinator")).toBeInTheDocument();
    expect(within(dialog).getByText("A supplied bio about Bio Person.")).toBeInTheDocument();
  });

  it("shows the larger photo (or the initials) in the dialog", async () => {
    renderTeam([withPhoto, withBio]);
    openCard("Photo Person");
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByAltText("Photo of Photo Person")).toHaveAttribute("src", "/photos/with-photo.jpg");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    openCard("Bio Person");
    const second = await screen.findByRole("dialog");
    expect(within(second).getByTestId("initials-avatar")).toHaveTextContent("BP");
  });

  it("shows social links only as safe, new-tab links", async () => {
    renderTeam([socialOnly]);
    openCard("Social Person");
    const dialog = await screen.findByRole("dialog");
    const link = within(dialog).getByRole("link", { name: /Instagram/ });
    expect(link).toHaveAttribute("href", "https://www.instagram.com/social.person");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.className).toContain("min-h-11");
  });

  it("closes with Escape and returns focus to the card", async () => {
    renderTeam([withBio]);
    const card = openCard("Bio Person");
    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(card));
  });

  it("has a full-size close button that closes it and returns focus to the card", async () => {
    renderTeam([withBio]);
    const card = openCard("Bio Person");
    const dialog = await screen.findByRole("dialog");
    const close = within(dialog).getByRole("button", { name: "Back to the team" });
    expect(close.className).toContain("min-h-11");
    fireEvent.click(close);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(card));
  });

  it("shows only the person who was chosen, then another when another card is chosen", async () => {
    renderTeam([withBio, socialOnly]);
    openCard("Bio Person");
    let dialog = await screen.findByRole("dialog", { name: "Bio Person" });
    expect(within(dialog).queryByText("Social Person")).toBeNull();
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    openCard("Social Person");
    dialog = await screen.findByRole("dialog", { name: "Social Person" });
    expect(within(dialog).queryByText("A supplied bio about Bio Person.")).toBeNull();
  });
});

describe("privacy", () => {
  it("shows no phone numbers, email addresses or internal notes, and no mailto/tel links", async () => {
    const m = member({ id: "private", name: "Private Person", bio: "Bio.", note: "SECRET-NOTE consent from parent on 1 Jan", order: 1 });
    const { container } = renderTeam([m, withBio]);
    fireEvent.click(screen.getAllByRole("button")[0]);
    await screen.findByRole("dialog");
    const text = document.body.textContent ?? "";
    expect(text).not.toContain("SECRET-NOTE");
    expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    expect(document.body.querySelector('a[href^="mailto:"], a[href^="tel:"]')).toBeNull();
    expect(container.querySelector('a[href^="mailto:"], a[href^="tel:"]')).toBeNull();
  });

  it("ends with 'Want to join the team? Become a volunteer.' linking to /volunteer", () => {
    const { container } = renderTeam([plain]);
    const line = Array.from(container.querySelectorAll("p")).find((p) => p.textContent?.includes("Want to join the team?"))!;
    expect(line.textContent).toBe("Want to join the team? Become a volunteer.");
    expect(within(line as HTMLElement).getByRole("link", { name: "Become a volunteer." })).toHaveAttribute("href", "/volunteer");
  });

  it("the volunteer line only exists when the section does", () => {
    renderTeam([]);
    expect(screen.queryByText(/Want to join the team/)).toBeNull();
  });
});
