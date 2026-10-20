import { EMAIL } from "@/data/siteConfig";

/** Plain `mailto:` link. Subject and body are percent-encoded (spaces as %20). */
export function buildMailtoUrl(subject: string, body?: string, to: string = EMAIL): string {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${to}?${params.join("&")}`;
}

/** Gmail web compose link, for people with no desktop mail app configured. */
export function buildGmailUrl(subject: string, body?: string, to: string = EMAIL): string {
  const params = [
    "view=cm",
    "fs=1",
    `to=${encodeURIComponent(to)}`,
    `su=${encodeURIComponent(subject)}`,
  ];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `https://mail.google.com/mail/?${params.join("&")}`;
}

/**
 * Copies text to the clipboard. Uses the async Clipboard API where available
 * and falls back to a hidden textarea for older or restricted browsers.
 * Resolves to true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
