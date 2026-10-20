import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, cleanup, renderPage } from "@/test/test-utils";
import Index from "@/pages/Index";
import VolunteerPage from "@/pages/VolunteerPage";
import VolunteerForm from "@/components/VolunteerForm";
import VolunteerPrefillProvider from "@/components/VolunteerPrefillProvider";
import { useVolunteerPrefill } from "@/hooks/use-volunteer-prefill";
import {
  buildEmailBody,
  buildPayload,
  normalisePhone,
  submitVolunteer,
  SubmitError,
  volunteerSchema,
} from "@/lib/volunteer";

const valid = {
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "+91 98765 43210",
  organisation: "Greenwood College",
  interests: ["Plantation drives", "Clean-Up drives"] as const,
  availability: "Weekends" as const,
  message: "",
  consent: true as const,
};

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("volunteer schema", () => {
  it("accepts a complete registration", () => {
    expect(volunteerSchema.safeParse({ ...valid, interests: [...valid.interests] }).success).toBe(true);
  });

  it.each([
    ["9876543210", true],
    ["+919876543210", true],
    ["+91 98765-43210", true],
    ["09876543210", true],
    ["5876543210", false], // must start 6-9
    ["98765 4321", false], // 9 digits
    ["+9198765432101", false], // 11 digits
    ["abcdefghij", false],
  ])("phone %s -> %s", (phone, ok) => {
    const result = volunteerSchema.safeParse({ ...valid, interests: [...valid.interests], phone });
    expect(result.success).toBe(ok);
  });

  it("needs at least one interest, an availability and consent", () => {
    const result = volunteerSchema.safeParse({
      ...valid,
      interests: [],
      availability: undefined,
      consent: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toEqual(expect.arrayContaining(["interests", "availability", "consent"]));
    }
  });

  it("normalises phone numbers and leaves the honeypot and consent out of the payload", () => {
    expect(normalisePhone("+91 98765 43210")).toBe("+919876543210");
    expect(normalisePhone("09876543210")).toBe("+919876543210");
    const payload = buildPayload({ ...valid, interests: [...valid.interests], website: "spam" });
    expect(payload.phone).toBe("+919876543210");
    expect(payload.interests).toBe("Plantation drives, Clean-Up drives");
    expect(JSON.stringify(payload)).not.toContain("spam");
  });

  it("writes every detail into the fallback email", () => {
    const body = buildEmailBody({ ...valid, interests: [...valid.interests] });
    for (const text of ["Asha Rao", "asha@example.com", "+919876543210", "Greenwood College", "Plantation drives, Clean-Up drives", "Weekends"]) {
      expect(body).toContain(text);
    }
  });
});

describe("submitVolunteer", () => {
  const payload = buildPayload({ ...valid, interests: [...valid.interests] });

  it("POSTs JSON and resolves on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    await submitVolunteer("https://example.com/hook", payload, fetchMock);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.com/hook");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body).name).toBe("Asha Rao");
  });

  it("uses a simple content type for Google Apps Script (no CORS preflight)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    await submitVolunteer("https://script.google.com/macros/s/abc/exec", payload, fetchMock);
    expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBe("text/plain;charset=utf-8");
  });

  it("throws on an error status and on a network failure", async () => {
    await expect(
      submitVolunteer("https://example.com/hook", payload, vi.fn().mockResolvedValue({ ok: false, status: 500 })),
    ).rejects.toBeInstanceOf(SubmitError);
    await expect(
      submitVolunteer("https://example.com/hook", payload, vi.fn().mockRejectedValue(new TypeError("offline"))),
    ).rejects.toBeInstanceOf(SubmitError);
  });
});

async function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: valid.name } });
  fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: valid.email } });
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: valid.phone } });
  fireEvent.click(screen.getByRole("checkbox", { name: "Plantation drives" }));
  fireEvent.click(screen.getByRole("radio", { name: "Weekends" }));
  fireEvent.click(screen.getByRole("checkbox", { name: /agree to be contacted/i }));
}

describe("volunteer form", () => {
  it("shows inline errors and sends nothing when empty", async () => {
    render(<VolunteerForm />);
    fireEvent.click(screen.getByRole("button", { name: "Become a Volunteer" }));

    expect(await screen.findByText("Please enter your name.")).toBeTruthy();
    expect(screen.getByText(/choose at least one area/i)).toBeTruthy();
    expect(screen.getByText(/please choose when you are usually free/i)).toBeTruthy();
    expect(screen.getByText(/agree to be contacted so we can reach you/i)).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("rejects a bad phone number", async () => {
    render(<VolunteerForm />);
    await fillValidForm();
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "12345" } });
    fireEvent.click(screen.getByRole("button", { name: "Become a Volunteer" }));
    expect(await screen.findByText(/10-digit Indian mobile/i)).toBeTruthy();
  });

  it("without an endpoint it opens a pre-filled email and does NOT show success", async () => {
    render(<VolunteerForm />);
    expect(screen.getByText(/submitting opens an email to our team/i)).toBeTruthy();
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Become a Volunteer" }));

    const dialog = await screen.findByRole("dialog", { name: /send your details by email/i });
    const mail = within(dialog).getByRole("link", { name: /open in email app/i });
    const href = decodeURIComponent(mail.getAttribute("href") ?? "");
    expect(href).toContain("subject=Volunteer Registration");
    expect(href).toContain("Asha Rao");
    expect(href).toContain("+919876543210");
    expect(within(dialog).getByText(/has not been sent yet/i)).toBeTruthy();
    expect(screen.queryByText(/thank you/i)).toBeNull();
  });

  it("pre-selects the interest chosen in an activity pop-up", async () => {
    const Trigger = () => {
      const { prefill } = useVolunteerPrefill();
      return <button onClick={() => prefill(["Clean-Up drives"])}>prefill</button>;
    };
    render(
      <VolunteerPrefillProvider>
        <Trigger />
        <VolunteerForm />
      </VolunteerPrefillProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "prefill" }));
    await waitFor(() =>
      expect(screen.getByRole("checkbox", { name: "Clean-Up drives" }).getAttribute("data-state")).toBe("checked"),
    );
  });
});

describe("volunteer form with an endpoint", () => {
  async function renderWithEndpoint(fetchMock: ReturnType<typeof vi.fn>) {
    vi.stubEnv("VITE_VOLUNTEER_ENDPOINT", "https://example.com/hook");
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { default: Form } = await import("@/components/VolunteerForm");
    render(<Form />);
  }

  it("sends the details, disables the button while sending, then thanks the person", async () => {
    let resolve!: (v: { ok: boolean }) => void;
    const fetchMock = vi.fn().mockReturnValue(new Promise((r) => (resolve = r)));
    await renderWithEndpoint(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Become a Volunteer" }));

    const sending = await screen.findByRole("button", { name: /sending/i });
    expect(sending.hasAttribute("disabled")).toBe(true);
    resolve({ ok: true });

    expect(await screen.findByText(/thank you — we'll reach out soon/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /whatsapp/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /instagram/i })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows an error with a retry that works, and keeps what was typed", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true });
    await renderWithEndpoint(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Become a Volunteer" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't send your details/i);
    expect((screen.getByLabelText(/^name/i) as HTMLInputElement).value).toBe(valid.name);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText(/thank you/i)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("silently drops a submission when the honeypot is filled", async () => {
    const fetchMock = vi.fn();
    await renderWithEndpoint(fetchMock);
    await fillValidForm();
    fireEvent.change(screen.getByLabelText(/leave this field empty/i), { target: { value: "http://spam" } });
    fireEvent.click(screen.getByRole("button", { name: "Become a Volunteer" }));
    await screen.findByText(/thank you/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never writes form data to the console", async () => {
    const spies = (["log", "info", "warn", "error", "debug"] as const).map((m) => vi.spyOn(console, m));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    await renderWithEndpoint(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Become a Volunteer" }));
    await screen.findByText(/thank you/i);
    for (const spy of spies) {
      const logged = JSON.stringify(spy.mock.calls);
      expect(logged).not.toContain(valid.email);
      expect(logged).not.toContain(valid.name);
    }
  });
});

describe("volunteer section and floating button", () => {
  it("keeps the section id, the form, Partner Up and a secondary WhatsApp link", () => {
    renderPage(<VolunteerPage />);
    const section = document.getElementById("volunteer")!;
    expect(within(section).getByRole("heading", { name: "Be Part of the Change" })).toBeTruthy();
    expect(within(section).getByRole("button", { name: "Become a Volunteer" })).toBeTruthy();
    expect(within(section).getByRole("button", { name: "Partner Up" })).toBeTruthy();
    expect(within(section).getAllByRole("link", { name: /join our whatsapp channel/i }).length).toBeGreaterThan(0);
    expect(within(section).getByAltText(/tunturu mahiti kendra/i)).toBeTruthy();
    expect(within(section).getByText(/we use these details only to contact you/i)).toBeTruthy();
  });

  it("the floating button stays hidden until the hero has been scrolled past", () => {
    renderPage(<Index />);
    // jsdom never reports the hero as scrolled past, so nothing should float yet.
    const floating = screen
      .queryAllByRole("link", { name: "Become a Volunteer" })
      .filter((a) => a.className.includes("fixed"));
    expect(floating).toHaveLength(0);
  });
});
