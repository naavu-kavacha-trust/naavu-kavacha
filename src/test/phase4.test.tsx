import { describe, it, expect, afterEach } from "vitest";
import { render, screen, within, cleanup, renderPage } from "@/test/test-utils";
import Index from "@/pages/Index";
import AboutPage from "@/pages/AboutPage";
import Impact from "@/components/Impact";
import { activities } from "@/data/activities";
import { formatStat, formatStatById, getImpactStats, getStat, getVerifiedStats, stats } from "@/data/impact";

afterEach(() => cleanup());

describe("impact data", () => {
  it("has unique ids and every stat explains itself", () => {
    const ids = stats.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of stats) {
      if (s.verified) expect(s.value, s.id).toBeGreaterThan(0);
      else expect(s.note, `${s.id} needs a TODO(client) note`).toMatch(/TODO\(client\)/);
    }
  });

  it("formats prefixes and suffixes", () => {
    expect(formatStatById("growing-ganesha")).toBe("150+");
    expect(formatStatById("paper-collected")).toBe("~773 kg");
    expect(formatStatById("seeds-collected")).toBe("15000+");
  });

  it("refuses to format an unverified or unknown stat", () => {
    expect(() => formatStatById("volunteers")).toThrow(/not verified/);
    expect(() => formatStatById("nope")).toThrow(/Unknown/);
  });

  it("keeps the client's verified figures", () => {
    const verified = Object.fromEntries(getVerifiedStats().map((s) => [s.id, formatStat(s)]));
    expect(verified).toEqual({
      "seeds-collected": "15000+",
      "seedballs-prepared": "5000+",
      "saplings-planted": "100+",
      "bird-feeders": "10+",
      "growing-ganesha": "150+",
      "paper-collected": "~773 kg",
      "student-awareness": "8000+",
    });
  });

  it("keeps the four unconfirmed stats hidden", () => {
    for (const id of ["activities-conducted", "schools-reached", "volunteers", "community-participation"]) {
      expect(getStat(id)?.verified, id).toBe(false);
    }
  });
});

describe("Impact section", () => {
  it("shows every verified stat and no unverified one", () => {
    render(<Impact />);
    const section = document.getElementById("impact")!;
    for (const s of getImpactStats()) {
      expect(within(section).getByText(s.label)).toBeTruthy();
      expect(within(section).getByText(formatStat(s), { selector: ".sr-only" })).toBeTruthy();
    }
    for (const s of stats.filter((x) => !x.verified)) {
      expect(within(section).queryByText(s.label), s.label).toBeNull();
    }
  });

  it("no longer has the vague 'Multiple Awareness Programs' tile", () => {
    render(<Impact />);
    expect(screen.queryByText(/multiple/i)).toBeNull();
    expect(screen.queryByText(/awareness programs/i)).toBeNull();
  });

  it("leads with results and has no Join Us link below the figures", () => {
    render(<Impact />);
    expect(screen.getByRole("heading", { name: "What We Have Achieved" })).toBeTruthy();
    expect(screen.getByText("Numbers That Matter")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Join Us" })).toBeNull();
  });
});

describe("one source for every number", () => {
  it("shows Growing Ganesha as 150+ everywhere and never 100+", () => {
    const { container } = renderPage(<Index />);
    expect(container.textContent).not.toMatch(/\b100\+/);
    expect(
      activities.find((a) => a.id === "growing-ganesha")?.highlights?.[0].value,
    ).toBe("150+");
  });

  it("Our Story shows the seeds and saplings figures from the data", () => {
    renderPage(<AboutPage />);
    const about = document.getElementById("story")!;
    expect(within(about).getByText("15000+")).toBeTruthy();
    expect(within(about).getByText("100+")).toBeTruthy();
  });

  it("Journey's paper figure matches the data", () => {
    renderPage(<AboutPage />);
    const journey = document.getElementById("journey")!;
    expect(within(journey).getByText("Paper collection drive (~773 kg collected)")).toBeTruthy();
  });

  it("activity highlights are the same strings the Impact section shows", () => {
    const labelled = new Map(getVerifiedStats().map((s) => [formatStat(s), s]));
    for (const a of activities) {
      for (const h of a.highlights ?? []) {
        expect(labelled.has(h.value), `${a.id}: ${h.value}`).toBe(true);
      }
    }
  });
});
