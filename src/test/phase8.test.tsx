import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, within, waitFor, cleanup, renderPage } from "@/test/test-utils";
import Index from "@/pages/Index";
import GalleryPage from "@/pages/GalleryPage";
import Gallery from "@/components/Gallery";
import {
  DEFAULT_GALLERY_ALT,
  buildGalleryImages,
  galleryCategories,
  galleryImages,
  type GalleryImage,
} from "@/data/gallery";

afterEach(() => cleanup());

const photos = (n: number, category?: (i: number) => string | undefined): GalleryImage[] =>
  Array.from({ length: n }, (_, i) => ({
    src: `/g${i + 1}.jpg`,
    alt: `Gallery photo ${i + 1}`,
    ...(category?.(i) ? { category: category(i) } : {}),
  }));

describe("gallery data", () => {
  it("sorts by file name naturally and uses the default alt text", () => {
    const images = buildGalleryImages(
      {
        "/src/assets/gallery/10.jpg": "/ten.jpg",
        "/src/assets/gallery/2.jpg": "/two.jpg",
        "/src/assets/gallery/01.jpg": "/one.jpg",
      },
      {},
    );
    expect(images.map((i) => i.src)).toEqual(["/one.jpg", "/two.jpg", "/ten.jpg"]);
    expect(images.every((i) => i.alt === DEFAULT_GALLERY_ALT)).toBe(true);
    expect(images.every((i) => i.caption === undefined && i.category === undefined)).toBe(true);
  });

  it("uses client-supplied alt, caption and category only when given", () => {
    const [a, b] = buildGalleryImages(
      { "/src/assets/gallery/01.jpg": "/one.jpg", "/src/assets/gallery/02.jpg": "/two.jpg" },
      { "02.jpg": { alt: "Planting", caption: "Sapling drive", category: "Saplings" } },
    );
    expect(a.alt).toBe(DEFAULT_GALLERY_ALT);
    expect(b).toMatchObject({ alt: "Planting", caption: "Sapling drive", category: "Saplings" });
  });

  it("picks up the team photo from the gallery folder", () => {
    expect(galleryImages.length).toBeGreaterThanOrEqual(1);
    expect(galleryImages.some((i) => i.alt.includes("Tunturu"))).toBe(true);
  });

  it("lists distinct categories in order", () => {
    expect(galleryCategories(photos(4, (i) => ["A", "B", "A", undefined][i]))).toEqual(["A", "B"]);
  });
});

describe("Gallery section", () => {
  it("renders the section anchor and thumbnails without a volunteer CTA", () => {
    const { container } = render(<Gallery images={photos(10)} />);
    expect(container.querySelector("section#gallery")).not.toBeNull();
    expect(screen.getAllByRole("button", { name: /^Open photo/ })).toHaveLength(10);
    expect(screen.queryByRole("button", { name: "Load more photos" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Be in the next photo" })).toBeNull();
  });

  it("reveals photos in batches of 12 and hides the button when all are shown", () => {
    render(<Gallery images={photos(25)} />);
    expect(screen.getAllByRole("button", { name: /^Open photo/ })).toHaveLength(12);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 12 of 25 photos");

    fireEvent.click(screen.getByRole("button", { name: "Load more photos" }));
    expect(screen.getAllByRole("button", { name: /^Open photo/ })).toHaveLength(24);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 24 of 25 photos");

    fireEvent.click(screen.getByRole("button", { name: "Load more photos" }));
    expect(screen.getAllByRole("button", { name: /^Open photo/ })).toHaveLength(25);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 25 of 25 photos");
    expect(screen.queryByRole("button", { name: "Load more photos" })).toBeNull();
  });

  it("resets the displayed count when a category filter changes", () => {
    render(<Gallery images={photos(30, (i) => (i < 18 ? "Seeds" : "Clean-ups"))} />);
    fireEvent.click(screen.getByRole("button", { name: "Load more photos" }));
    expect(screen.getAllByRole("button", { name: /^Open photo/ })).toHaveLength(24);

    fireEvent.click(screen.getByRole("button", { name: "Seeds" }));
    expect(screen.getAllByRole("button", { name: /^Open photo/ })).toHaveLength(12);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 12 of 18 photos");
    expect(screen.getByRole("button", { name: "Load more photos" })).toBeInTheDocument();
  });

  it("pads a short gallery with hidden placeholder tiles, never clickable", () => {
    const { container } = render(<Gallery images={photos(3)} />);
    expect(screen.getAllByRole("button", { name: /^Open photo/ })).toHaveLength(3);
    expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(5);
  });

  it("shows no filter chips without categories, and chips when two or more exist", () => {
    const { unmount } = render(<Gallery images={photos(4)} />);
    expect(screen.queryByRole("group", { name: "Filter photos by category" })).toBeNull();
    unmount();
    render(<Gallery images={photos(4, (i) => (i < 2 ? "Seeds" : "Clean-ups"))} />);
    const group = screen.getByRole("group", { name: "Filter photos by category" });
    expect(within(group).getAllByRole("button").map((b) => b.textContent)).toEqual(["All", "Seeds", "Clean-ups"]);
    fireEvent.click(within(group).getByRole("button", { name: "Seeds" }));
    expect(screen.getAllByRole("button", { name: /^Open photo/ })).toHaveLength(2);
    expect(within(group).getByRole("button", { name: "Seeds" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens the lightbox on the tapped photo, navigates, and returns focus on close", async () => {
    render(<Gallery images={photos(5)} />);
    const thumb = screen.getAllByRole("button", { name: /^Open photo/ })[2];
    thumb.focus();
    fireEvent.click(thumb);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("3 / 5")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    await waitFor(() => expect(within(dialog).getByText("4 / 5")).toBeInTheDocument());
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    await waitFor(() => expect(within(dialog).getByText("2 / 5")).toBeInTheDocument());
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(thumb).toHaveFocus());
  });

  it("only cycles through the filtered photos in the lightbox", async () => {
    render(<Gallery images={photos(4, (i) => (i < 3 ? "Seeds" : "Clean-ups"))} />);
    fireEvent.click(screen.getByRole("button", { name: "Clean-ups" }));
    fireEvent.click(screen.getAllByRole("button", { name: /^Open photo/ })[0]);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("1 / 1")).toBeInTheDocument();
  });

  it("lets the lightbox navigate to photos whose thumbnails have not been revealed", async () => {
    render(<Gallery images={photos(15)} />);
    fireEvent.click(screen.getByRole("button", { name: /^Open photo 12 of 15/ }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("12 / 15")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    await waitFor(() => expect(within(dialog).getByText("13 / 15")).toBeInTheDocument());
  });

  it("is on the page after Special Moments as the real gallery, not the old placeholder", () => {
    const { container } = renderPage(<GalleryPage />);
    const ids = [...container.querySelectorAll("section[id]")].map((s) => s.id);
    expect(ids.indexOf("gallery")).toBeGreaterThan(ids.indexOf("special-moments"));
    expect(container.querySelector("section#gallery")).not.toHaveAttribute("aria-hidden");
  });
});
