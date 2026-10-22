import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor, cleanup, renderPage } from "@/test/test-utils";
import OurWorkPage from "@/pages/OurWorkPage";
import { ACTIVITY_CATEGORIES, activities, getActivity } from "@/data/activities";
import { VOLUNTEER_INTERESTS } from "@/data/interests";

/** The activity card button in the Projects grid (What We Do and the filter chips can share a name). */
function card(title: string): HTMLElement {
  const projects = document.getElementById("projects")!;
  const match = within(projects)
    .getAllByRole("button", { name: title })
    .find((b) => b.getAttribute("aria-haspopup") === "dialog");
  if (!match) throw new Error(`No activity card named ${title}`);
  return match;
}

beforeEach(() => {
  window.history.replaceState(null, "", "/our-work");
});

afterEach(() => {
  cleanup();
});

describe("activity data", () => {
  it("has unique ids and only references activities that exist", () => {
    const ids = activities.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of activities) {
      for (const rel of a.related ?? []) {
        expect(getActivity(rel), `${a.id} -> ${rel}`).toBeDefined();
        expect(rel).not.toBe(a.id);
      }
    }
  });

  it("uses known categories and volunteer interests", () => {
    for (const a of activities) {
      expect(ACTIVITY_CATEGORIES).toContain(a.category);
      expect(VOLUNTEER_INTERESTS).toContain(a.interestTag);
    }
  });

  it("calls it Clean-Up Drive everywhere, never Cleaning Drive", () => {
    expect(JSON.stringify(activities)).not.toMatch(/cleaning drive/i);
    expect(getActivity("clean-up-drive")?.title).toBe("Clean-Up Drive");
  });

  it("shows 150+ Growing Ganesha", () => {
    expect(getActivity("growing-ganesha")?.highlights).toContainEqual({
      label: "Growing Ganesha",
      value: "150+",
    });
  });
});

describe("Projects grid", () => {
  it("renders a card for every activity", () => {
    renderPage(<OurWorkPage />);
    for (const a of activities) {
      expect(card(a.title)).toBeTruthy();
    }
  });

  it("filters by category and shows all again", () => {
    renderPage(<OurWorkPage />);
    const group = screen.getByRole("group", { name: /filter activities/i });

    fireEvent.click(within(group).getByRole("button", { name: "Clean-Up" }));
    expect(within(group).getByRole("button", { name: "Clean-Up" }).getAttribute("aria-pressed")).toBe("true");
    expect(card("Clean-Up Drive")).toBeTruthy();

    fireEvent.click(within(group).getByRole("button", { name: "All" }));
    expect(card("Seedball Dispersal")).toBeTruthy();
  });
});

describe("Activity modal", () => {
  it("opens from a card and puts the activity in the URL", async () => {
    renderPage(<OurWorkPage />);
    fireEvent.click(card("Growing Ganesha"));

    const dialog = await screen.findByRole("dialog", { name: "Growing Ganesha" });
    expect(within(dialog).getByText("150+")).toBeTruthy();
    expect(window.location.hash).toBe("#projects/growing-ganesha");
  });

  it("only shows fields that have data", async () => {
    renderPage(<OurWorkPage />);
    fireEvent.click(card("Clean-Up Drive"));
    const dialog = await screen.findByRole("dialog");
    // Clean-Up has no highlights, locations or date in the data.
    expect(within(dialog).queryByText("Outcomes")).toBeNull();
    expect(within(dialog).queryByRole("list", { name: "Locations" })).toBeNull();
    expect(within(dialog).getByText("Purpose")).toBeTruthy();
  });

  it("closes with Escape and restores #projects", async () => {
    renderPage(<OurWorkPage />);
    fireEvent.click(card("Sapling Plantation"));
    const dialog = await screen.findByRole("dialog");

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(window.location.hash).toBe("#projects");
  });

  it("switches to a related activity from its chips", async () => {
    renderPage(<OurWorkPage />);
    fireEvent.click(card("Sapling Plantation"));
    const dialog = await screen.findByRole("dialog", { name: "Sapling Plantation" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Seedball Dispersal" }));
    expect(screen.getByRole("dialog", { name: "Seedball Dispersal" })).toBeTruthy();
    expect(window.location.hash).toBe("#projects/seedball-dispersal");
  });

  it("opens straight from a #projects/<id> link", async () => {
    window.history.replaceState(null, "", "/#projects/bird-feeders");
    renderPage(<OurWorkPage />);
    expect(await screen.findByRole("dialog", { name: "Bamboo Bird Feeders" })).toBeTruthy();
  });

  it("ignores a link to an activity that does not exist", () => {
    window.history.replaceState(null, "", "/#projects/not-a-thing");
    renderPage(<OurWorkPage />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("returns focus to the card that opened it", async () => {
    renderPage(<OurWorkPage />);
    const seedCard = card("Seed Collection");
    seedCard.focus();
    fireEvent.click(seedCard);
    fireEvent.keyDown(await screen.findByRole("dialog"), { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(seedCard));
  });

  it("Volunteer button closes the modal and opens the Volunteer page", async () => {
    renderPage(<OurWorkPage />);
    fireEvent.click(card("Clean-Up Drive"));
    fireEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: /volunteer for this activity/i }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(window.location.pathname).toBe("/volunteer"));
    // That the interest arrives ticked on the Volunteer page is checked end to end in pages.test.tsx.
  });
});
