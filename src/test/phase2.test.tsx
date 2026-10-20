import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within, waitFor, renderPage } from "@/test/test-utils";
import Index from "@/pages/Index";
import VolunteerPage from "@/pages/VolunteerPage";
import ContactDialog from "@/components/ContactDialog";
import { buildGmailUrl, buildMailtoUrl, copyToClipboard } from "@/lib/contact";
import { EMAIL, NAV_ITEMS } from "@/data/siteConfig";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("contact helpers", () => {
  it("builds a mailto link with an encoded subject and body", () => {
    const url = buildMailtoUrl("Partnership Inquiry", "Hello team,\n\nHi");
    expect(url).toBe(
      `mailto:${EMAIL}?subject=Partnership%20Inquiry&body=Hello%20team%2C%0A%0AHi`,
    );
    expect(url).not.toMatch(/\s/);
  });

  it("builds a Gmail compose link for the same address", () => {
    const url = buildGmailUrl("General Inquiry");
    expect(url.startsWith("https://mail.google.com/mail/?view=cm")).toBe(true);
    expect(url).toContain(`to=${encodeURIComponent(EMAIL)}`);
    expect(url).toContain("su=General%20Inquiry");
  });

  it("copies with the Clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await expect(copyToClipboard(EMAIL)).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith(EMAIL);
  });

  it("falls back to execCommand when the Clipboard API is missing", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    document.execCommand = vi.fn().mockReturnValue(true);
    await expect(copyToClipboard(EMAIL)).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });
});

describe("ContactDialog", () => {
  it("opens from its trigger and offers all three routes", () => {
    render(
      <ContactDialog subject="Partnership Inquiry">
        <button>Partner Up</button>
      </ContactDialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Partner Up" }));

    const dialog = screen.getByRole("dialog");
    const mail = within(dialog).getByRole("link", { name: /open in email app/i });
    const gmail = within(dialog).getByRole("link", { name: /open in gmail/i });
    expect(mail.getAttribute("href")).toContain(`mailto:${EMAIL}?subject=Partnership%20Inquiry`);
    expect(gmail.getAttribute("href")).toContain("mail.google.com");
    expect(gmail.getAttribute("target")).toBe("_blank");
    expect(gmail.getAttribute("rel")).toContain("noopener");
    expect(within(dialog).getByRole("button", { name: /copy email address/i })).toBeTruthy();
  });
});

describe("page wiring", () => {
  it("shows Partner Up on the Volunteer page and Email Us in the footer, and no raw mailto links remain", () => {
    const { container } = renderPage(<VolunteerPage />);
    expect(screen.getByRole("button", { name: "Partner Up" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Email Us" })).toBeTruthy();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("Partner Up opens the dialog with the partnership subject", () => {
    renderPage(<VolunteerPage />);
    fireEvent.click(screen.getByRole("button", { name: "Partner Up" }));
    const mail = within(screen.getByRole("dialog")).getByRole("link", { name: /open in email app/i });
    expect(mail.getAttribute("href")).toContain("subject=Partnership%20Inquiry");
  });

  it("the home page says Become a Volunteer / Join Us, never Connect", () => {
    renderPage(<Index />);
    expect(screen.queryByText("Connect")).toBeNull();
    expect(screen.queryByText("Join the Movement")).toBeNull();
    // The hero button and the closing band; the Impact section adds a "Join Us" link.
    expect(screen.getAllByRole("link", { name: "Become a Volunteer" }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("link", { name: "Join Us" })).toHaveAttribute("href", "/volunteer");
  });
});

describe("navigation", () => {
  it("lists the five items in order in the desktop bar", () => {
    renderPage(<Index />);
    const main = screen.getByRole("navigation", { name: "Main" });
    const labels = within(main)
      .getAllByRole("link")
      .map((a) => a.textContent)
      .filter((t) => NAV_ITEMS.some((n) => n.label === t));
    expect(labels).toEqual(NAV_ITEMS.map((n) => n.label));
  });

  it("mobile menu opens with every item, and closes after a tap", async () => {
    renderPage(<Index />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const dialog = screen.getByRole("dialog");
    const mobileNav = within(dialog).getByRole("navigation", { name: "Mobile" });
    for (const item of NAV_ITEMS) {
      expect(within(mobileNav).getByRole("link", { name: item.label })).toBeTruthy();
    }
    expect(within(dialog).getByRole("link", { name: "Volunteer" })).toHaveAttribute("href", "/volunteer");

    fireEvent.click(within(mobileNav).getByRole("link", { name: "About Us" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(window.location.pathname).toBe("/about"));
  });

  it("mobile Contact closes the menu and jumps to the footer instead of opening a page", async () => {
    window.history.replaceState(null, "", "/");
    renderPage(<Index />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");
    fireEvent.click(
      within(within(screen.getByRole("dialog")).getByRole("navigation", { name: "Mobile" })).getByRole("link", {
        name: "Contact",
      }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(scrollSpy).toHaveBeenCalled());
    expect(window.location.pathname).toBe("/");
    expect(window.location.hash).toBe("#contact");
  });

  it("mobile Email Us closes the menu and opens the email chooser", async () => {
    renderPage(<Index />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Email Us" }));

    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: /email naavu kavacha/i })).toBeTruthy(),
    );
  });
});
