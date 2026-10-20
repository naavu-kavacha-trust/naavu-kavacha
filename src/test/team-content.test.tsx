import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import AboutPage from "@/pages/AboutPage";
import { getCoFounders, getCoreTeam, getFounders, paragraphsOf } from "@/data/team";
import { renderPage } from "@/test/test-utils";

/**
 * The wording the site owner supplied for the founder and co-founder, exactly as they sent it.
 * If someone edits the words in src/data/team.ts, this fails, so wording is never changed by accident.
 * (If the owner sends new wording, update it here too.)
 */
const SUPPLIED_FOUNDER =
  "Ajay Gowda H is an environmentalist, student and the founder of Naavu Kavacha, driven by a deep commitment to environmental conservation, community development, and youth empowerment. Through grassroots initiatives across Karnataka, he has been working to inspire environmental responsibility and turn collective action into meaningful change. From seed conservation and plantation drives to lake and forest clean-ups, his efforts focus on engaging young people and communities in protecting nature. With a vision to build sustainable communities where conservation becomes a way of life, Ajay continues to lead initiatives that nurture environmental awareness, encourage community participation, and contribute towards a greener and more sustainable future.";

const SUPPLIED_COFOUNDER =
  "Nidhi B S is a student, environmentalist, and the co-founder of Naavu Kavacha, driven by a deep commitment to environmental conservation, community development, and youth empowerment. Through her involvement in grassroots initiatives across Karnataka, she contributes to inspiring environmental responsibility and turning collective action into meaningful change. With strengths in planning, community outreach, and engaging people, she plays an active role in initiatives ranging from environmental awareness programmes and plantation drives to lake and forest clean-ups. Guided by her discipline and dedication, Nidhi shares the vision of building sustainable communities where conservation becomes a way of life, contributing towards a greener and more sustainable future.";

beforeEach(() => {
  window.history.replaceState(null, "", "/about");
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
});
afterEach(() => cleanup());

describe("the supplied founder and co-founder", () => {
  it("are in the shipped data, one each, with the roles they were given", () => {
    const [founder] = getFounders();
    const [coFounder] = getCoFounders();
    expect(getFounders()).toHaveLength(1);
    expect(getCoFounders()).toHaveLength(1);
    expect([founder.name, founder.role]).toEqual(["Ajay Gowda H", "Founder"]);
    expect([coFounder.name, coFounder.role]).toEqual(["Nidhi B S", "Co-Founder"]);
    expect(getCoreTeam()).toEqual([]);
  });

  it("the wording is exactly what was supplied; the only change is a paragraph break", () => {
    expect(paragraphsOf(getFounders()[0].bio).join(" ")).toBe(SUPPLIED_FOUNDER);
    expect(paragraphsOf(getCoFounders()[0].bio).join(" ")).toBe(SUPPLIED_COFOUNDER);
    expect(paragraphsOf(getFounders()[0].bio)).toHaveLength(2);
    expect(paragraphsOf(getCoFounders()[0].bio)).toHaveLength(2);
  });

  it("nothing was added that was not supplied: no message, quote, social links or contact details", () => {
    for (const person of [...getFounders(), ...getCoFounders()]) {
      expect(person.message, person.name).toBeUndefined();
      expect(person.quote, person.name).toBeUndefined();
      expect(person.social, person.name).toBeUndefined();
      expect(person.photo, person.name).toBeUndefined();
    }
  });

  it("keeps a note that the written consent still has to be confirmed (and that it is never shown)", () => {
    for (const person of [...getFounders(), ...getCoFounders()]) {
      expect(person.note).toMatch(/consent .* not yet confirmed/i);
    }
  });
});

describe("how they appear on the About page", () => {
  it("each has a heading, name, role and both paragraphs, in the right section", () => {
    const { container } = renderPage(<AboutPage />);
    for (const [id, heading, name, role, supplied] of [
      ["founder", "Our Founder", "Ajay Gowda H", "Founder", SUPPLIED_FOUNDER],
      ["cofounder", "Our Co-Founder", "Nidhi B S", "Co-Founder", SUPPLIED_COFOUNDER],
    ] as const) {
      const section = within(container.querySelector(`#${id}`) as HTMLElement);
      expect(section.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
      expect(section.getByRole("heading", { level: 3, name })).toBeInTheDocument();
      expect(section.getByText(role)).toBeInTheDocument();
      const paragraphs = Array.from((container.querySelector(`#${id}`) as HTMLElement).querySelectorAll(".max-w-prose p")).map((p) => p.textContent);
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs.join(" ")).toBe(supplied);
    }
  });

  it("shows initials avatars (AG and NB) until photos are added, with the names still visible", () => {
    const { container } = renderPage(<AboutPage />);
    const avatars = within(container.querySelector(".about-page") as HTMLElement).getAllByTestId("initials-avatar");
    expect(avatars.map((a) => a.textContent)).toEqual(["AG", "NB"]);
    expect(container.querySelector("#founder img, #cofounder img")).toBeNull();
  });

  it("puts the Founder before the Co-Founder, with mirrored portraits and opposite backgrounds", () => {
    const { container } = renderPage(<AboutPage />);
    const founder = container.querySelector("#founder") as HTMLElement;
    const coFounder = container.querySelector("#cofounder") as HTMLElement;
    expect(founder.compareDocumentPosition(coFounder) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const portrait = (el: HTMLElement) => (el.querySelector("article")!.firstElementChild as HTMLElement).className.includes("md:order-2");
    expect([portrait(founder), portrait(coFounder)]).toEqual([false, true]);
    expect(founder.className).not.toBe(coFounder.className);
  });

  it("the sub-navigation links to both", () => {
    renderPage(<AboutPage />);
    const labels = within(screen.getByRole("navigation", { name: "On this page" })).getAllByRole("link").map((a) => a.textContent);
    expect(labels).toEqual(["Our Story", "Founder", "Co-Founder", "Journey", "Future Plans"]);
  });

  it("the internal note never reaches the page", () => {
    const { container } = renderPage(<AboutPage />);
    expect(container.textContent).not.toMatch(/consent/i);
    expect(container.textContent).not.toContain("project chat");
  });
});
