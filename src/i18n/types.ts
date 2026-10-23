export type Locale = "en" | "kn" | "hi";

export type MessageCatalog = Record<string, string>;

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  kn: "ಕನ್ನಡ",
  hi: "हिन्दी",
};

export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment === "kn" || segment === "hi" ? segment : "en";
}

export function unlocalizedPath(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (locale === "en") return pathname || "/";
  const path = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");
  return path || "/";
}

export function localizedPath(locale: Locale, path: string): string {
  if (!path.startsWith("/")) return path;
  const clean = unlocalizedPath(path);
  return locale === "en" ? clean : `/${locale}${clean === "/" ? "" : clean}`;
}
