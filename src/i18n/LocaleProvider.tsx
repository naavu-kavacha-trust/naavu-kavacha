import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Locale, MessageCatalog } from "./types";
import { localeFromPath, localizedPath } from "./types";

interface LocaleState {
  locale: Locale;
  ready: boolean;
  catalog: MessageCatalog;
}

const LocaleContext = createContext<LocaleState>({ locale: "en", ready: true, catalog: {} });
const scriptFontUrls: Record<Exclude<Locale, "en">, string> = {
  kn: "https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap",
  hi: "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap",
};
const translatedAttributes = ["aria-label", "aria-description", "placeholder", "title", "alt"];

function translateValue(value: string, catalog: MessageCatalog, locale: Locale): string {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  // JSX whitespace can be emitted with line breaks or indentation; compare a
  // normalized key so a translation does not depend on source formatting.
  const trimmed = value.trim().replace(/\s+/g, " ");
  // Keep the footer's legal wording in its original English form in every locale.
  let translated = trimmed === "All rights reserved." ? trimmed : catalog[trimmed];
  if (!translated) {
    const moreCount = trimmed.match(/^\+(\d+) more$/i);
    const copyright = trimmed.match(/^©\s*(\d{4})\s+NAAVU KAVACHA\. All rights reserved\.$/i);
    const copyrightSuffix = trimmed.match(/^NAAVU KAVACHA\. All rights reserved\.$/i);
    const shown = trimmed.match(/^Showing (\d+) of (\d+) photos$/);
    const activities = trimmed.match(/^Showing (\d+) (activities|activity)$/);
    const counter = trimmed.match(/^Photo (\d+) of (\d+)$/);
    const photoIndex = trimmed.match(/^Go to photo (\d+)$/);
    const activityPhoto = trimmed.match(/^(.+): Naavu Kavacha photo (\d+)$/);
    const photoList = trimmed.match(/^(.+) photos$/);
    const openPhoto = trimmed.match(/^Open photo (\d+) of (\d+): (.+)$/);
    const galleryPhoto = trimmed.match(/^See this photo in the gallery: (.+)$/);
    const social = trimmed.match(/^(.+) on (Instagram|LinkedIn) \(opens in a new tab\)$/);
    const portrait = trimmed.match(/^Photo of (.+)$/i);
    const teamMember = trimmed.match(/^(.+), (Founder|Co-Founder|Core Team)$/);
    const paperCollection = trimmed.match(/^Paper collection drive at KSVP: (~?[0-9][0-9,]*(?:\.[0-9]+)?\s*kg) of paper collected$/i);
    if (moreCount) translated = locale === "kn"
      ? `+${moreCount[1]} ಇನ್ನಷ್ಟು`
      : `+${moreCount[1]} और`;
    else if (copyright) translated = trimmed;
    else if (copyrightSuffix) translated = trimmed;
    else if (shown) translated = locale === "kn"
      ? `${shown[2]} ಚಿತ್ರಗಳಲ್ಲಿ ${shown[1]} ತೋರಿಸಲಾಗುತ್ತಿದೆ`
      : `${shown[2]} तस्वीरों में से ${shown[1]} दिखाई जा रही हैं`;
    else if (activities) translated = locale === "kn"
      ? `${activities[1]} ಚಟುವಟಿಕೆಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ`
      : `${activities[1]} गतिविधियाँ दिखाई जा रही हैं`;
    else if (counter) translated = locale === "kn"
      ? `${counter[2]}ರಲ್ಲಿ ${counter[1]}ನೇ ಚಿತ್ರ`
      : `${counter[2]} में से तस्वीर ${counter[1]}`;
    else if (photoIndex) translated = locale === "kn"
      ? `${photoIndex[1]}ನೇ ಚಿತ್ರಕ್ಕೆ ಹೋಗಿ`
      : `तस्वीर ${photoIndex[1]} पर जाएँ`;
    else if (activityPhoto) {
      const title = catalog[activityPhoto[1]] ?? activityPhoto[1];
      translated = locale === "kn"
        ? `${title}: ನಾವೂ ಕವಚದ ಚಿತ್ರ ${activityPhoto[2]}`
        : `${title}: Naavu Kavacha की तस्वीर ${activityPhoto[2]}`;
    }
    else if (photoList) {
      const title = catalog[photoList[1]] ?? photoList[1];
      translated = locale === "kn" ? `${title} — ಚಿತ್ರಗಳು` : `${title} — तस्वीरें`;
    }
    else if (openPhoto) translated = locale === "kn"
      ? `${openPhoto[2]}ರಲ್ಲಿ ${openPhoto[1]}ನೇ ಚಿತ್ರ ತೆರೆಯಿರಿ: ${translateValue(openPhoto[3], catalog, locale)}`
      : `${openPhoto[2]} में से तस्वीर ${openPhoto[1]} खोलें: ${translateValue(openPhoto[3], catalog, locale)}`;
    else if (galleryPhoto) translated = locale === "kn"
      ? `ಗ್ಯಾಲರಿಯಲ್ಲಿ ಈ ಚಿತ್ರ ನೋಡಿ: ${translateValue(galleryPhoto[1], catalog, locale)}`
      : `गैलरी में यह तस्वीर देखें: ${translateValue(galleryPhoto[1], catalog, locale)}`;
    else if (portrait) translated = locale === "kn"
      ? `${translateValue(portrait[1], catalog, locale)} ಅವರ ಭಾವಚಿತ್ರ`
      : `${translateValue(portrait[1], catalog, locale)} का चित्र`;
    else if (teamMember) translated = `${teamMember[1]}, ${catalog[teamMember[2]] ?? teamMember[2]}`;
    else if (social) translated = locale === "kn"
      ? `${social[1]} — ${social[2] === "Instagram" ? "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್" : "ಲಿಂಕ್ಡ್‌ಇನ್"} (ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತದೆ)`
      : `${social[1]} — ${social[2] === "Instagram" ? "इंस्टाग्राम" : "लिंक्डइन"} (नए टैब में खुलेगा)`;
    else if (paperCollection) translated = locale === "kn"
      ? "KSVPಯಲ್ಲಿ ನಡೆದ ಕಾಗದ ಸಂಗ್ರಹ ಅಭಿಯಾನದಲ್ಲಿ " + paperCollection[1] + " ಕಾಗದ ಸಂಗ್ರಹಿಸಲಾಯಿತು"
      : "KSVP में हुए काग़ज़ संग्रह अभियान में " + paperCollection[1] + " काग़ज़ इकट्ठा किया गया";
  }
  return translated ? `${leading}${translated}${trailing}` : value;
}

function applyCatalog(root: Node, catalog: MessageCatalog, locale: Locale) {
  const replace = (value: string) => translateValue(value, catalog, locale);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let text: Node | null;
  while ((text = walker.nextNode())) {
    const value = text.nodeValue;
    if (value?.trim()) {
      const next = replace(value);
      if (next !== value) text.nodeValue = next;
    }
  }

  if (root instanceof Element) {
    const elements = [root, ...root.querySelectorAll("*")];
    for (const element of elements) {
      if (element instanceof HTMLInputElement && element.type === "hidden") continue;
      for (const attribute of translatedAttributes) {
        const value = element.getAttribute(attribute);
        if (value) {
          const next = replace(value);
          if (next !== value) element.setAttribute(attribute, next);
        }
      }
      const href = element.getAttribute("href");
      if (href?.startsWith("/") && !href.startsWith("//")) {
        const path = href.split(/[?#]/, 1)[0];
        const suffix = href.slice(path.length);
        const next = localizedPath(locale, path);
        if (next + suffix !== href) element.setAttribute("href", next + suffix);
      }
    }
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const locale = localeFromPath(pathname);
  const [catalog, setCatalog] = useState<MessageCatalog>({});
  const [loadedLocale, setLoadedLocale] = useState<Locale>("en");
  const ready = locale === "en" || loadedLocale === locale;

  useEffect(() => {
    let active = true;
    if (locale === "en") {
      setCatalog({});
      setLoadedLocale("en");
      return () => { active = false; };
    }
    const load = locale === "kn"
      ? import("./catalogs/kn").then((module) => module.default)
      : import("./catalogs/hi").then((module) => module.default);
    void load.then((messages) => {
      if (active) {
        setCatalog(messages);
        setLoadedLocale(locale);
      }
    });
    return () => { active = false; };
  }, [locale]);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale === "kn" ? "kn" : locale === "hi" ? "hi" : "en";
    html.dataset.locale = locale;
    if (locale === "en") {
      delete html.dataset.localePending;
      return;
    }
    html.dataset.localePending = "true";
    const loadFont = () => {
      if (document.querySelector(`link[data-locale-font="${locale}"]`)) return;
      const font = document.createElement("link");
      font.rel = "stylesheet";
      font.href = scriptFontUrls[locale];
      font.media = "print";
      font.onload = () => { font.media = "all"; };
      font.dataset.localeFont = locale;
      document.head.append(font);
    };
    // Inject after the document's load event so a third-party font request never holds up page navigation.
    if (document.readyState === "complete") loadFont();
    else window.addEventListener("load", loadFont, { once: true });
    return () => window.removeEventListener("load", loadFont);
  }, [locale]);

  useEffect(() => {
    if (!ready) return;
    if (locale === "en") {
      document.documentElement.removeAttribute("data-locale-pending");
      return;
    }
    // Dialogs, menus and other Radix overlays are portaled as siblings of #root.
    // Observe the body so they receive the same translations as page content.
    const root = document.body;
    applyCatalog(root, catalog, locale);
    document.documentElement.removeAttribute("data-locale-pending");
    const localizeInternalClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || event.defaultPrevented) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || localeFromPath(url.pathname) !== locale) return;
      event.preventDefault();
      navigate(`${url.pathname}${url.search}${url.hash}`);
    };
    root.addEventListener("click", localizeInternalClick, true);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData" && record.target.nodeValue?.trim()) {
          const value = record.target.nodeValue;
          const translated = translateValue(value, catalog, locale);
          if (translated !== value) record.target.nodeValue = translated;
        }
        for (const node of record.addedNodes) applyCatalog(node, catalog, locale);
        if (record.type === "attributes" && record.target instanceof Element) {
          const attr = record.attributeName;
          if (attr && translatedAttributes.includes(attr)) {
            const value = record.target.getAttribute(attr);
            if (value) {
              const translated = translateValue(value, catalog, locale);
              if (translated !== value) record.target.setAttribute(attr, translated);
            }
          }
          if (attr === "href") {
            const value = record.target.getAttribute("href");
            if (value?.startsWith("/") && !value.startsWith("//")) {
              const path = value.split(/[?#]/, 1)[0];
              const suffix = value.slice(path.length);
              const localized = localizedPath(locale, path);
              if (localized + suffix !== value) record.target.setAttribute("href", localized + suffix);
            }
          }
        }
      }
    });
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...translatedAttributes, "href"] });
    return () => {
      observer.disconnect();
      root.removeEventListener("click", localizeInternalClick, true);
    };
  }, [catalog, locale, navigate, ready]);

  const value = useMemo(() => ({ locale, ready, catalog }), [locale, ready, catalog]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
