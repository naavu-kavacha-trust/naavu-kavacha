import { describe, expect, it } from "vitest";
import { localeFromPath, localizedPath, unlocalizedPath, LOCALE_LABELS } from "@/i18n/types";
import kannada from "@/i18n/catalogs/kn";
import hindi from "@/i18n/catalogs/hi";
import { VOLUNTEER_INTERESTS } from "@/data/interests";
import { AVAILABILITY_OPTIONS } from "@/lib/volunteer";
import { getWhatWeDoActivities } from "@/data/activities";
import { getImpactStats } from "@/data/impact";

describe("locale URL helpers", () => {
  it("uses the URL as the language source and preserves English paths", () => {
    expect(localeFromPath("/about")).toBe("en");
    expect(localeFromPath("/kn/about")).toBe("kn");
    expect(localeFromPath("/hi/volunteer")).toBe("hi");
    expect(unlocalizedPath("/kn/about")).toBe("/about");
    expect(localizedPath("en", "/kn/about")).toBe("/about");
    expect(localizedPath("kn", "/about")).toBe("/kn/about");
    expect(localizedPath("hi", "/")).toBe("/hi");
  });

  it("uses the requested language names in the picker", () => {
    expect(LOCALE_LABELS).toEqual({ en: "English", kn: "ಕನ್ನಡ", hi: "हिन्दी" });
  });
});

describe("translation catalog coverage", () => {
  it.each([["Kannada", kannada], ["Hindi", hindi]] as const)("has localized navigation, form, metadata and dialog copy for %s", (_language, catalog) => {
    for (const key of [
      "Home", "About Us", "Our Work", "Gallery", "Contact", "Volunteer", "Change language",
      "Name *", "Email *", "Phone number *", "Availability *", "Submit", "Please enter your name.",
      "Privacy Policy", "Terms of Service", "Photo viewer", "Previous", "Next",
      "About Us | Naavu Kavacha Trust", "Naavu Kavacha Trust is a student-driven environmental initiative in Karnataka focused on seed collection, plantation drives, clean-ups, and community awareness.",
      "The Journey So Far", "Growing change, one school and one small action at a time.",
      "This policy explains what personal information Naavu Kavacha Trust (\"the Trust\", \"we\", \"us\") collects through this website, why we collect it, who sees it, how long we keep it and what choices you have.",
      "Google Apps Script receives volunteer form submissions, records them in Google Sheets and sends an email notification to the Trust. Google also provides the services that store and deliver those records and notifications. Our web host and email provider also process information to provide their services.",
      "Children and adults pose together at an environmental event booth.",
      "A speaker with a microphone addressing schoolchildren lined up in rows in a school playground",
      "Numbers That Matter", "What We Have Achieved",
      "Every figure below was earned by student volunteers, one seed, one sapling and one school at a time.",
      "Real results come from many hands. Add yours to the next number.",
      "See all projects & activities", "Creating Awareness", "Seedball Preparation",
      "Student-Driven Environmental Initiative",
      "A student-driven environmental initiative creating a greener Earth through awareness, seed collection, plantation drives and community action.",
      "Follow us on Instagram",
    ]) expect(catalog[key], `missing ${key}`).toBeTruthy();
    expect(kannada["Student-Driven Environmental Initiative"]).toBe("ವಿದ್ಯಾರ್ಥಿಗಳಿಂದ ಮುನ್ನಡೆಯುವ ಪರಿಸರ ಚಳುವಳಿ");
    for (const activity of getWhatWeDoActivities()) {
      const title = activity.whatWeDo.title ?? activity.title;
      const description = activity.whatWeDo.description ?? activity.summary;
      expect(catalog[title], `missing activity title: ${title}`).toBeTruthy();
      expect(catalog[description], `missing activity description: ${description}`).toBeTruthy();
    }
    for (const stat of getImpactStats()) {
      expect(catalog[stat.label], `missing impact label: ${stat.label}`).toBeTruthy();
    }
    expect(VOLUNTEER_INTERESTS).toContain("Plantation drives");
    expect(AVAILABILITY_OPTIONS).toContain("Weekends");
    expect(catalog["Plantation drives"]).not.toBe("Plantation drives");
    expect(catalog.Weekends).not.toBe("Weekends");
  });
});
