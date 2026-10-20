import { z } from "zod";
import { VOLUNTEER_INTERESTS } from "@/data/interests";

export const AVAILABILITY_OPTIONS = ["Weekends", "Weekdays", "Both", "Specific events only"] as const;

/** Spaces, dashes and brackets people type into phone numbers. */
const stripPhoneSeparators = (value: string) => value.replace(/[\s\-().]/g, "");

/** 10-digit Indian mobile number starting 6-9, with an optional +91 / 91 / 0 prefix. */
const INDIAN_MOBILE = /^(?:\+?91|0)?[6-9]\d{9}$/;

export const volunteerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "That name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .email("That doesn't look like a valid email address.")
    .max(200),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter your phone number.")
    .refine((v) => INDIAN_MOBILE.test(stripPhoneSeparators(v)), {
      message: "Enter a 10-digit Indian mobile number (starting 6-9), with or without +91.",
    }),
  organisation: z.string().trim().max(150, "That is too long.").optional(),
  interests: z
    .array(z.enum(VOLUNTEER_INTERESTS))
    .min(1, "Choose at least one area you'd like to help with."),
  availability: z.enum(AVAILABILITY_OPTIONS, {
    errorMap: () => ({ message: "Please choose when you are usually free." }),
  }),
  message: z.string().trim().max(1000, "Please keep this under 1000 characters.").optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please agree to be contacted so we can reach you." }),
  }),
  /** Honeypot: hidden from people, so only bots fill it in. */
  website: z.string().optional(),
});

export type VolunteerFormValues = z.infer<typeof volunteerSchema>;

/** Form defaults. `consent` starts unticked (undefined until the person decides). */
export const volunteerDefaults = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  interests: [] as VolunteerFormValues["interests"],
  availability: undefined,
  message: "",
  consent: undefined,
  website: "",
};

/** Normalises a valid Indian mobile number to `+91XXXXXXXXXX`. */
export function normalisePhone(value: string): string {
  const digits = stripPhoneSeparators(value).replace(/^\+?(?:91|0)?/, "");
  return `+91${digits.slice(-10)}`;
}

/** What is sent to the endpoint. The honeypot and consent flag are not included. */
export function buildPayload(values: VolunteerFormValues) {
  return {
    submittedAt: new Date().toISOString(),
    name: values.name.trim(),
    email: values.email.trim(),
    phone: normalisePhone(values.phone),
    organisation: values.organisation?.trim() ?? "",
    interests: values.interests.join(", "),
    availability: values.availability,
    message: values.message?.trim() ?? "",
    consent: "Agreed to be contacted about volunteering",
    source: "naavu-kavacha-website",
  };
}

export type VolunteerPayload = ReturnType<typeof buildPayload>;

/** Plain-text email body for the no-endpoint fallback. */
export function buildEmailBody(values: VolunteerFormValues): string {
  const p = buildPayload(values);
  return [
    "Hello Naavu Kavacha team,",
    "",
    "I'd like to volunteer. My details:",
    "",
    `Name: ${p.name}`,
    `Email: ${p.email}`,
    `Phone: ${p.phone}`,
    `College / Organisation: ${p.organisation || "-"}`,
    `Areas of interest: ${p.interests}`,
    `Availability: ${p.availability}`,
    `Message: ${p.message || "-"}`,
    "",
    "I agree to be contacted by Naavu Kavacha about volunteering.",
  ].join("\n");
}

const REQUEST_TIMEOUT_MS = 15000;

/** Google Apps Script web apps reject the preflight a JSON content type triggers. */
function isAppsScript(endpoint: string): boolean {
  try {
    const host = new URL(endpoint).hostname;
    return host === "script.google.com" || host.endsWith(".googleusercontent.com");
  } catch {
    return false;
  }
}

export class SubmitError extends Error {}

/**
 * POSTs the registration as JSON. Resolves only on a successful (2xx) response;
 * throws SubmitError otherwise (network failure, timeout or an error status).
 * Never logs the payload.
 */
export async function submitVolunteer(
  endpoint: string,
  payload: VolunteerPayload,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: isAppsScript(endpoint)
        ? { "Content-Type": "text/plain;charset=utf-8" }
        : { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new SubmitError(`Request failed with status ${response.status}`);
  } catch (error) {
    if (error instanceof SubmitError) throw error;
    throw new SubmitError("Could not reach the server");
  } finally {
    clearTimeout(timer);
  }
}
