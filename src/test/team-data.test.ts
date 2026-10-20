import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import {
  GROUP_COPY,
  getCoFounders,
  getCoreTeam,
  getFounders,
  getSafeSocial,
  initialsOf,
  paragraphsOf,
  resolveTeamPhoto,
  selectTeam,
  teamMembers,
  type TeamMember,
} from "@/data/team";

const person = (over: Partial<TeamMember> = {}): TeamMember => ({
  id: "test-person",
  group: "founder",
  name: "Test Person",
  role: "Test role",
  order: 1,
  consent: true,
  ...over,
});

describe("who may appear", () => {
  it("only people with consent, and only in their own group", () => {
    const list = [
      person({ id: "f1", group: "founder" }),
      person({ id: "f2", group: "founder", consent: false }),
      person({ id: "c1", group: "cofounder" }),
      person({ id: "k1", group: "core" }),
      person({ id: "k2", group: "core", consent: false }),
    ];
    expect(selectTeam(list, "founder").map((m) => m.id)).toEqual(["f1"]);
    expect(selectTeam(list, "cofounder").map((m) => m.id)).toEqual(["c1"]);
    expect(selectTeam(list, "core").map((m) => m.id)).toEqual(["k1"]);
  });

  it("a person is never in two groups, so a founder is never also in the core grid", () => {
    const list = [person({ id: "a", group: "founder" }), person({ id: "b", group: "cofounder" }), person({ id: "c", group: "core" })];
    const seen = (["founder", "cofounder", "core"] as const).flatMap((g) => selectTeam(list, g).map((m) => m.id));
    expect(seen.sort()).toEqual(["a", "b", "c"]);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("sorts each group by order, lowest first", () => {
    const list = [person({ id: "late", order: 5 }), person({ id: "early", order: 1 }), person({ id: "mid", order: 3 })];
    expect(selectTeam(list, "founder").map((m) => m.id)).toEqual(["early", "mid", "late"]);
  });

  it("consent must be exactly true (not just truthy)", () => {
    const sneaky = person({ consent: "yes" as unknown as boolean });
    expect(selectTeam([sneaky], "founder")).toEqual([]);
  });

  it("the shipped list follows the privacy rules", () => {
    const ids = teamMembers.map((m) => m.id);
    expect(new Set(ids).size, "ids are unique").toBe(ids.length);
    for (const m of teamMembers) {
      expect(["founder", "cofounder", "core"], m.id).toContain(m.group);
      expect(typeof m.consent, m.id).toBe("boolean");
      // Anyone who is shown must have a record of where their consent and text came from.
      if (m.consent) expect(m.note?.trim(), `${m.id} needs a note`).toBeTruthy();
      // No personal phone numbers or email addresses, anywhere.
      const text = JSON.stringify({ ...m, social: undefined, note: undefined });
      expect(text, m.id).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
      expect(text, m.id).not.toMatch(/(?<!\d)(\+?\d[\d\s-]{8,}\d)(?!\d)/);
    }
  });

  it("splits supplied text into paragraphs at blank lines, changing no words", () => {
    expect(paragraphsOf("One.\n\nTwo.\n \n  Three.  ")).toEqual(["One.", "Two.", "Three."]);
    expect(paragraphsOf("Single paragraph.")).toEqual(["Single paragraph."]);
    expect(paragraphsOf(undefined)).toEqual([]);
    expect(paragraphsOf("   ")).toEqual([]);
  });

  it("the site helpers read the shipped list", () => {
    expect(getFounders()).toEqual(selectTeam(teamMembers, "founder"));
    expect(getCoFounders()).toEqual(selectTeam(teamMembers, "cofounder"));
    expect(getCoreTeam()).toEqual(selectTeam(teamMembers, "core"));
  });

  it("section wording exists for both groups, with plural forms", () => {
    for (const g of ["founder", "cofounder"] as const) {
      const c = GROUP_COPY[g];
      expect(c.heading && c.headingMany && c.eyebrow && c.chip && c.chipMany).toBeTruthy();
    }
  });
});

describe("social links", () => {
  it("keeps https links only", () => {
    const m = person({
      social: [
        { label: "LinkedIn", url: "https://www.linkedin.com/in/someone" },
        { label: "Instagram", url: "http://insecure.example.com/x" },
        { label: "Instagram", url: "javascript:alert(1)" },
        { label: "LinkedIn", url: "not a url" },
        { label: "LinkedIn", url: "" },
      ],
    });
    expect(getSafeSocial(m).map((s) => s.url)).toEqual(["https://www.linkedin.com/in/someone"]);
  });

  it("is empty when none were supplied", () => {
    expect(getSafeSocial(person())).toEqual([]);
  });
});

describe("initials for the no-photo avatar", () => {
  it.each([
    ["Priya Rao", "PR"],
    ["priya rao", "PR"],
    ["  Anil   Kumar  Shetty ", "AK"],
    // Many names end in a single initial: the first two words give the natural initials.
    ["Ajay Gowda H", "AG"],
    ["Nidhi B S", "NB"],
    ["Meera", "M"],
    ["", ""],
    ["   ", ""],
    ["ಅನ್ವಿತ ರಾವ್", "ಅರ"],
  ])("%j -> %j", (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});

describe("photo lookup", () => {
  const files = {
    "/src/assets/team/priya-rao.jpg": "/a/priya.jpg",
    "/src/assets/team/custom-name.png": "/a/custom.png",
    "/src/assets/team/meera.webp": "/a/meera.webp",
  };

  it("finds <id>.jpg by default (any supported extension)", () => {
    expect(resolveTeamPhoto(person({ id: "priya-rao" }), files)).toBe("/a/priya.jpg");
    expect(resolveTeamPhoto(person({ id: "meera" }), files)).toBe("/a/meera.webp");
  });

  it("uses the `photo` file name when one is given", () => {
    expect(resolveTeamPhoto(person({ id: "someone", photo: "custom-name.png" }), files)).toBe("/a/custom.png");
  });

  it("is null (initials shown) when there is no matching file", () => {
    expect(resolveTeamPhoto(person({ id: "nobody" }), files)).toBeNull();
    expect(resolveTeamPhoto(person({ id: "priya-rao", photo: "missing.jpg" }), files)).toBeNull();
    expect(resolveTeamPhoto(person({ id: "priya-rao" }), {})).toBeNull();
  });

  it("does not mistake a longer file name for the person's photo", () => {
    expect(resolveTeamPhoto(person({ id: "priya" }), files)).toBeNull();
  });
});

/**
 * Privacy guard for photos. Team photos must have all camera and location data removed, and be web-sized.
 * This reads every JPEG in src/assets/team/ (none yet) and fails if one still carries EXIF/GPS metadata.
 */
const segmentsOf = (jpeg: Uint8Array) => {
  const found: { marker: number; label: string }[] = [];
  let i = 2;
  while (i + 4 <= jpeg.length && jpeg[i] === 0xff) {
    const marker = jpeg[i + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = (jpeg[i + 2] << 8) | jpeg[i + 3];
    const label = Buffer.from(jpeg.slice(i + 4, i + 4 + 6)).toString("latin1");
    found.push({ marker, label });
    i += 2 + length;
  }
  return found;
};
const hasExif = (jpeg: Uint8Array) => segmentsOf(jpeg).some((s) => s.marker === 0xe1 && s.label.startsWith("Exif"));
const hasXmp = (jpeg: Uint8Array) => segmentsOf(jpeg).some((s) => s.marker === 0xe1 && s.label.startsWith("http:"));
const widthOf = (jpeg: Uint8Array) => {
  let i = 2;
  while (i + 9 < jpeg.length) {
    const marker = jpeg[i + 1];
    if (marker >= 0xc0 && marker <= 0xc3) return (jpeg[i + 7] << 8) | jpeg[i + 8];
    i += 2 + ((jpeg[i + 2] << 8) | jpeg[i + 3]);
  }
  return 0;
};
const fakeJpeg = (...segments: number[][]) =>
  Uint8Array.from([0xff, 0xd8, ...segments.flat(), 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x10, 0x04, 0xb0, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9]);
const app1 = (text: string) => {
  const body = Array.from(Buffer.from(text, "latin1"));
  return [0xff, 0xe1, 0x00, body.length + 2, ...body];
};

describe("team photo files", () => {
  it("the checker itself spots EXIF and XMP segments, and passes a clean file", () => {
    expect(hasExif(fakeJpeg(app1("Exif\0\0GPS")))).toBe(true);
    expect(hasXmp(fakeJpeg(app1("http://ns.adobe.com/xap")))).toBe(true);
    expect(hasExif(fakeJpeg())).toBe(false);
    expect(hasXmp(fakeJpeg())).toBe(false);
    expect(widthOf(fakeJpeg())).toBe(1200);
  });

  const dir = resolve(__dirname, "../assets/team");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f)) : [];

  it.each(files.length ? files : ["(no photos supplied yet)"])("%s has no EXIF/GPS, is at most 1200 px wide and about 250 KB", (file) => {
    if (!files.length) return;
    const bytes = readFileSync(resolve(dir, file));
    expect(hasExif(bytes), "EXIF (camera/GPS) data must be removed").toBe(false);
    expect(hasXmp(bytes), "XMP metadata must be removed").toBe(false);
    expect(widthOf(bytes)).toBeLessThanOrEqual(1200);
    expect(statSync(resolve(dir, file)).size).toBeLessThanOrEqual(260 * 1024);
  });
});
