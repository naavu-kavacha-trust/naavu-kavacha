import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, within, waitFor, cleanup, renderPage } from "@/test/test-utils";
import { useState } from "react";
import Index from "@/pages/Index";
import GalleryPage from "@/pages/GalleryPage";
import Lightbox, { type LightboxImage } from "@/components/Lightbox";
import OathSlider from "@/components/OathSlider";
import { buildOathImages, oathCopy, oathImages } from "@/data/oath";

afterEach(() => cleanup());

const photos = (n: number): LightboxImage[] =>
  Array.from({ length: n }, (_, i) => ({ src: `/p${i + 1}.jpg`, alt: `Photo number ${i + 1}` }));

describe("oath data", () => {
  it("sorts files naturally and writes neutral alt text without inventing names", () => {
    const images = buildOathImages({
      "/src/assets/oath/10.jpg": "/ten.jpg",
      "/src/assets/oath/2.jpg": "/two.jpg",
      "/src/assets/oath/01.jpg": "/one.jpg",
    });
    expect(images.map((i) => i.src)).toEqual(["/one.jpg", "/two.jpg", "/ten.jpg"]);
    expect(images[0].alt).toBe("A guest signing the Oath for Change (photo 1)");
    expect(images.every((i) => i.caption === undefined)).toBe(true);
  });

  it("uses client-supplied captions and alt text only when given", () => {
    const images = buildOathImages(
      { "/src/assets/oath/01.jpg": "/one.jpg", "/src/assets/oath/02.jpg": "/two.jpg" },
      { "02.jpg": { alt: "Signing the oath", caption: "A caption from the team" } },
    );
    expect(images[0].caption).toBeUndefined();
    expect(images[1]).toMatchObject({ alt: "Signing the oath", caption: "A caption from the team" });
  });

  it("keeps the client's wording verbatim", () => {
    expect(oathCopy.heading).toBe("Oath for Change – A Living Milestone");
    expect(oathCopy.paragraphs.join(" ")).toBe(
      '"Oath for Change – A Living Milestone" became even more meaningful as respected personalities and public figures added their signatures to the movement, turning every autograph into a symbol of responsibility and hope. From inspiring conversations to shared commitments for society and the environment, each celebrity signature strengthened the vision that change begins with an oath — and lives on through action.',
    );
  });
});

describe("Special Moments section", () => {
  it("keeps the Waterman story and adds the Oath block under it, with the copy and a CTA", () => {
    renderPage(<GalleryPage />);
    const section = document.getElementById("special-moments")!;
    expect(within(section).getByRole("heading", { name: "Meeting the Waterman of India" })).toBeTruthy();
    const oath = within(section).getByRole("heading", { name: "Oath for Change – A Living Milestone" });
    expect(oath).toBeTruthy();
    expect(section.textContent).toContain("each celebrity signature strengthened the vision");
    expect(within(section).getByRole("link", { name: "Take the oath with us" }).getAttribute("href")).toBe("/volunteer");
    expect(section.querySelector("hr")).not.toBeNull();
  });

  it("never prints the developer instruction", () => {
    const { container } = renderPage(<Index />);
    expect(container.textContent).not.toMatch(/slide bar/i);
    expect(container.textContent).not.toMatch(/we want more images/i);
  });

  it("still renders a slider when there are no photos yet, with no broken controls", () => {
    expect(oathImages.length).toBeGreaterThanOrEqual(0);
    render(<OathSlider images={[]} />);
    expect(screen.getByRole("region", { name: "Oath for Change photos" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /photo/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /pause slideshow/i })).toBeNull();
  });
});

describe("Oath slider", () => {
  it("shows every photo as a button with dot navigation and no pause control", () => {
    render(<OathSlider images={photos(4)} />);
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByRole("button", { name: `Photo number ${i}` })).toBeTruthy();
    }
    expect(screen.queryByRole("button", { name: /pause slideshow|play slideshow/i })).toBeNull();
  });

  it("opens the lightbox on the tapped photo and returns focus when closed", async () => {
    render(<OathSlider images={photos(4)} />);
    const second = screen.getByRole("button", { name: "Photo number 2" });
    second.focus();
    fireEvent.click(second);

    const dialog = await screen.findByRole("dialog", { name: "Photo viewer" });
    expect(within(dialog).getByAltText("Photo number 2")).toBeTruthy();
    expect(within(dialog).getByText("2 / 4")).toBeTruthy();

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(second));
  });
});

describe("Lightbox", () => {
  const Harness = ({ start = 0, images = photos(5), onClose = () => {} }: { start?: number; images?: LightboxImage[]; onClose?: () => void }) => {
    const [index, setIndex] = useState<number | null>(start);
    return (
      <Lightbox
        images={images}
        index={index}
        onIndexChange={setIndex}
        onClose={() => {
          setIndex(null);
          onClose();
        }}
      />
    );
  };

  it("shows the counter and caption", () => {
    render(<Harness images={[{ src: "/a.jpg", alt: "A", caption: "First caption" }, { src: "/b.jpg", alt: "B" }]} />);
    expect(screen.getByText("1 / 2")).toBeTruthy();
    expect(screen.getByText("First caption")).toBeTruthy();
  });

  it("moves with the buttons and wraps around", () => {
    render(<Harness start={4} />);
    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByText("1 / 5")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(screen.getByText("5 / 5")).toBeTruthy();
  });

  it("moves with the arrow keys and closes with Escape", async () => {
    const onClose = vi.fn();
    render(<Harness start={1} onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(screen.getByText("3 / 5")).toBeTruthy();
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(screen.getByText("1 / 5")).toBeTruthy();
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("closes from the close button", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close photo viewer" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("has no previous/next with a single photo", () => {
    render(<Harness images={photos(1)} />);
    expect(screen.queryByRole("button", { name: "Next photo" })).toBeNull();
    expect(screen.getByText("1 / 1")).toBeTruthy();
  });

  it("preloads the neighbouring photos", () => {
    const created: string[] = [];
    const RealImage = window.Image;
    vi.stubGlobal(
      "Image",
      class {
        set src(v: string) {
          created.push(v);
        }
      },
    );
    render(<Harness start={2} />);
    vi.stubGlobal("Image", RealImage);
    expect(created).toEqual(expect.arrayContaining(["/p2.jpg", "/p4.jpg"]));
  });
});
