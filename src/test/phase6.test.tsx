import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor, cleanup, renderPage } from "@/test/test-utils";
import Index from "@/pages/Index";
import VolunteerPage from "@/pages/VolunteerPage";
import GalleryPage from "@/pages/GalleryPage";
import OurWorkPage from "@/pages/OurWorkPage";
import { activities } from "@/data/activities";

beforeEach(() => {
  window.history.replaceState(null, "", "/our-work");
});
afterEach(() => cleanup());

const section = () => document.getElementById("whatwedo")!;

describe("What We Do cards", () => {
  it("shows the seven cards in order, with the original names where they differ", () => {
    renderPage(<OurWorkPage />);
    const titles = within(section())
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent)
      // the Clean-Up feature block below the grid has its own h3
      .slice(0, 7);
    expect(titles).toEqual([
      "Creating Awareness",
      "Seed Collection",
      "Seedball Preparation",
      "Sapling Plantation",
      "Bamboo Bird Feeders",
      "Growing Ganesha",
      "Clean-Up Drive",
    ]);
  });

  it("uses the activity data for the text (no duplicated copy)", () => {
    renderPage(<OurWorkPage />);
    for (const id of ["seed-collection", "sapling-plantation", "growing-ganesha", "clean-up-drive", "bird-feeders"]) {
      const a = activities.find((x) => x.id === id)!;
      expect(within(section()).getByText(a.summary), id).toBeTruthy();
    }
    expect(
      within(section()).getByText("Preparing seedballs using clay, soil, and manure to support natural reforestation."),
    ).toBeTruthy();
  });

  it("shows a real photo wherever one exists and the icon treatment only where it does not", () => {
    renderPage(<OurWorkPage />);
    for (const a of activities.filter((x) => x.whatWeDo)) {
      const cardEl = section().querySelector(`[data-whatwedo-card="${a.id}"]`)!.closest("article")!;
      if (a.coverImage) {
        expect(cardEl.querySelector("img"), `${a.id} should have a photo`).not.toBeNull();
        expect(cardEl.querySelector("svg.lucide-circle, svg.lucide-sparkles, svg.lucide-sprout"), a.id).toBeNull();
      } else {
        expect(cardEl.querySelector("img"), `${a.id} has no photo yet`).toBeNull();
        expect(cardEl.querySelector("svg"), `${a.id} should keep its icon`).not.toBeNull();
      }
    }
  });

  it("uses the supplied seedball and clean-up photos", () => {
    renderPage(<OurWorkPage />);
    const seedball = section().querySelector('[data-whatwedo-card="seedball-dispersal"]')!.closest("article")!;
    expect(seedball.querySelector("img")?.getAttribute("src")).toContain("seedball-preparation");
    const cleanup = section().querySelector('[data-whatwedo-card="clean-up-drive"]')!.closest("article")!;
    expect(cleanup.querySelector("img")?.getAttribute("src")).toContain("cleanup-drive");
  });

  it("opens the shared activity pop-up, even when the card is named differently", async () => {
    renderPage(<OurWorkPage />);
    fireEvent.click(within(section()).getByRole("button", { name: "Seedball Preparation" }));
    expect(await screen.findByRole("dialog", { name: "Seedball Dispersal" })).toBeTruthy();
    expect(window.location.hash).toBe("#projects/seedball-dispersal");
  });

  it("returns focus to the What We Do card after closing", async () => {
    renderPage(<OurWorkPage />);
    const cardButton = within(section()).getByRole("button", { name: "Growing Ganesha" });
    cardButton.focus();
    fireEvent.click(cardButton);
    fireEvent.keyDown(await screen.findByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(cardButton));
  });
});

describe("Clean-Up Drive feature block", () => {
  const block = () => within(section()).getByRole("group", { name: /cleaner streets/i });

  it("sits under the card grid and uses the supplied photo and the activity text", () => {
    renderPage(<OurWorkPage />);
    const el = block();
    expect(el.querySelector("img")?.getAttribute("src")).toContain("cleanup-drive");
    expect(within(el).getByText(/collecting and segregating waste to restore/i)).toBeTruthy();
    const grid = section().querySelector("ul")!;
    expect(grid.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("'See Clean-Up Drives' opens the Clean-Up pop-up", async () => {
    renderPage(<OurWorkPage />);
    fireEvent.click(within(block()).getByRole("button", { name: "See Clean-Up Drives" }));
    expect(await screen.findByRole("dialog", { name: "Clean-Up Drive" })).toBeTruthy();
  });

  it("'Join the next drive' goes to the Volunteer page", async () => {
    renderPage(<OurWorkPage />);
    const link = within(block()).getByRole("link", { name: "Join the next drive" });
    expect(link.getAttribute("href")).toBe("/volunteer");
    fireEvent.click(link);

    await waitFor(() => expect(window.location.pathname).toBe("/volunteer"));
    // That Clean-Up drives arrives ticked is checked end to end in pages.test.tsx.
  });
});

describe("generic icons replaced", () => {
  it("Special Moments no longer has the standalone droplets icon", () => {
    renderPage(<GalleryPage />);
    expect(document.getElementById("special-moments")!.querySelector("svg.lucide-droplets")).toBeNull();
  });

  it("Volunteer section no longer has the heart icon", () => {
    renderPage(<VolunteerPage />);
    expect(document.getElementById("volunteer")!.querySelector("svg.lucide-heart")).toBeNull();
  });
});
