import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import AboutPage from "@/pages/AboutPage";
import { getCoFounders, getCoreTeam, getFounders, paragraphsOf } from "@/data/team";
import { renderPage } from "@/test/test-utils";

/**
 * Expected concise founder and co-founder bios shown on the About page.
 */
const SUPPLIED_FOUNDER =
  "Ajay Gowda H is an environmentalist, student, and founder of Naavu Kavacha. He leads grassroots work across Karnataka, including seed conservation, plantation drives, lake and forest clean-ups, and community awareness initiatives. His work engages young people and communities in protecting nature and building a more sustainable future. Driven by a commitment to community development and youth empowerment, he inspires environmental responsibility and collective action. He envisions sustainable communities where conservation becomes a way of life.";

const SUPPLIED_COFOUNDER =
  "Nidhi B S is a student, environmentalist, and co-founder of Naavu Kavacha. She supports grassroots initiatives across Karnataka through planning, community outreach, environmental awareness, plantation drives, and clean-ups. Her work helps engage communities in conservation and contributes to a greener, more sustainable future. She is dedicated to turning collective action into meaningful change and building communities where conservation becomes a way of life. Her discipline and dedication support the trust’s vision for a sustainable future.";

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
    expect(getCoreTeam()).toHaveLength(6);
  });

  it("keeps both bios concise and in a single paragraph", () => {
    expect(paragraphsOf(getFounders()[0].bio).join(" ")).toBe(SUPPLIED_FOUNDER);
    expect(paragraphsOf(getCoFounders()[0].bio).join(" ")).toBe(SUPPLIED_COFOUNDER);
    expect(paragraphsOf(getFounders()[0].bio)).toHaveLength(1);
    expect(paragraphsOf(getCoFounders()[0].bio)).toHaveLength(1);
  });

  it("does not invent messages, quotes or social links", () => {
    for (const person of [...getFounders(), ...getCoFounders()]) {
      expect(person.message, person.name).toBeUndefined();
      expect(person.quote, person.name).toBeUndefined();
      expect(person.social, person.name).toBeUndefined();
      expect(person.photo, person.name).toBeTruthy();
    }
  });

  it("keeps the confirmed consent note internal", () => {
    for (const person of [...getFounders(), ...getCoFounders()]) {
      expect(person.note).toMatch(/confirmed consent for publication/i);
    }
  });
});

describe("how they appear on the About page", () => {
  it("each has a heading, name, role and one concise bio paragraph, in the right section", () => {
    const { container } = renderPage(<AboutPage />);
    for (const [id, heading, name, role, supplied] of [
      ["founder", "Meet Our Founder", "Ajay Gowda H", "Founder", SUPPLIED_FOUNDER],
      ["cofounder", "Meet Our Co-Founder", "Nidhi B S", "Co-Founder", SUPPLIED_COFOUNDER],
    ] as const) {
      const section = within(container.querySelector(`#${id}`) as HTMLElement);
      expect(section.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
      expect(section.getByRole("heading", { level: 3, name })).toBeInTheDocument();
      expect(section.getByText(role)).toBeInTheDocument();
      const paragraphs = Array.from((container.querySelector(`#${id}`) as HTMLElement).querySelectorAll(".max-w-prose p")).map((p) => p.textContent);
      expect(paragraphs).toHaveLength(1);
      expect(paragraphs.join(" ")).toBe(supplied);
    }
  });

  it("shows responsive founder portraits with accessible names", () => {
    const { container } = renderPage(<AboutPage />);
    const images = Array.from(container.querySelectorAll("#founder img, #cofounder img"));
    expect(images).toHaveLength(2);
    expect(images.map((image) => image.getAttribute("alt"))).toEqual([
      "Ajay Gowda H, Founder",
      "Nidhi B S, Co-Founder",
    ]);
    expect(images.every((image) => image.getAttribute("srcset")?.includes("384w"))).toBe(true);
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
    expect(labels).toEqual(["Our Story", "Founder", "Co-Founder", "Core Team", "Journey", "Future Plans"]);
  });

  it("the internal note never reaches the page", () => {
    const { container } = renderPage(<AboutPage />);
    expect(container.textContent).not.toMatch(/consent/i);
    expect(container.textContent).not.toContain("project chat");
  });
});
