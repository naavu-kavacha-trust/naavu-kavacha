import { ChevronDown, Globe } from "lucide-react";
import { useLocation } from "react-router-dom";
import { localizedPath, LOCALE_LABELS, type Locale } from "@/i18n/types";
import { useLocale } from "@/i18n/LocaleProvider";

const options: Locale[] = ["en", "kn", "hi"];

export default function LanguagePicker({
  className = "",
  heroOverlay = false,
}: {
  className?: string;
  heroOverlay?: boolean;
}) {
  const { locale } = useLocale();
  const location = useLocation();
  return (
    <label className={`relative inline-flex h-10 w-[7.5rem] items-center justify-center rounded-full border px-3 text-sm transition-[background-color,border-color,box-shadow] duration-200 ease-out focus-within:ring-2 focus-within:ring-offset-2 ${
      heroOverlay
        ? "border-sand/60 bg-bark/75 text-sand shadow-sm backdrop-blur-sm hover:bg-bark/85 focus-within:ring-sand focus-within:ring-offset-transparent"
        : "border-border bg-background/60 text-foreground hover:bg-muted focus-within:ring-ring focus-within:ring-offset-background"
    } ${className}`}>
      <Globe className="pointer-events-none absolute left-3 h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Change language</span>
      <span aria-hidden="true" data-testid="language-picker-label" className={`pointer-events-none absolute ${locale === "en" ? "left-[calc(50%+2px)] top-1/2" : locale === "kn" ? "left-1/2 top-[calc(50%+3px)]" : "left-1/2 top-[calc(50%+2px)]"} -translate-x-1/2 -translate-y-1/2 whitespace-nowrap`}>
        {LOCALE_LABELS[locale]}
      </span>
      <select
        aria-label="Change language"
        className="localized-language-picker absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none rounded-full bg-transparent text-center text-transparent outline-none"
        value={locale}
        onChange={(event) => {
          const targetLocale = event.target.value as Locale;
          const nextPath = localizedPath(targetLocale, location.pathname);
          window.location.assign(`${nextPath}${location.search}${location.hash}`);
        }}
      >
        {options.map((option) => <option key={option} value={option}>{LOCALE_LABELS[option]}</option>)}
      </select>
      <ChevronDown className="language-picker-chevron pointer-events-none absolute right-3 h-4 w-4 transition-transform duration-200 ease-out" aria-hidden="true" />
    </label>
  );
}
