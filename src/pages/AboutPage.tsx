import AboutSubNav, { type SubNavItem } from "@/components/AboutSubNav";
import CoreTeam from "@/components/CoreTeam";
import FounderSection, { type SectionTone } from "@/components/FounderSection";
import FuturePlans from "@/components/FuturePlans";
import Journey from "@/components/Journey";
import MissionVision from "@/components/MissionVision";
import OurStory from "@/components/OurStory";
import PageHero from "@/components/PageHero";
import { aboutContent, hasMissionSection, missionSectionTitle } from "@/data/about";
import { PAGE_HEROES, PAGE_META, SECTION_IDS } from "@/data/siteConfig";
import { GROUP_COPY, getCoFounders, getCoreTeam, getFounders } from "@/data/team";
import { usePageMeta } from "@/hooks/use-page-meta";

/**
 * About Us: the story, then (as they are supplied) mission and vision, the founder, the co-founder, the core
 * team, the journey and future plans. A part with nothing to show renders nothing, and its chip drops out of
 * the sub-navigation. The page ends with Future Plans' own "Join Us" button.
 */
const AboutPage = () => {
  usePageMeta(PAGE_META.about);

  const hasMission = hasMissionSection(aboutContent);
  const founders = getFounders();
  const coFounders = getCoFounders();
  const core = getCoreTeam();

  // Keep the long page alternating cream and sand: Our Story is cream, and every optional section that is
  // actually present flips the background. (Mission & Vision is always sand, which matches its first flip.)
  let tone: SectionTone = "cream";
  const flip = (): SectionTone => (tone = tone === "cream" ? "sand" : "cream");
  if (hasMission) flip();
  const founderTone = founders.length > 0 ? flip() : tone;
  const coFounderTone = coFounders.length > 0 ? flip() : tone;
  const coreTone = core.length > 0 ? flip() : tone;

  const items: SubNavItem[] = [
    { id: SECTION_IDS.story, label: "Our Story" },
    ...(hasMission ? [{ id: SECTION_IDS.mission, label: missionSectionTitle(aboutContent) }] : []),
    ...(founders.length > 0
      ? [{ id: SECTION_IDS.founder, label: founders.length > 1 ? GROUP_COPY.founder.chipMany : GROUP_COPY.founder.chip }]
      : []),
    ...(coFounders.length > 0
      ? [
          {
            id: SECTION_IDS.cofounder,
            label: coFounders.length > 1 ? GROUP_COPY.cofounder.chipMany : GROUP_COPY.cofounder.chip,
          },
        ]
      : []),
    ...(core.length > 0 ? [{ id: SECTION_IDS.team, label: GROUP_COPY.core.chip }] : []),
    { id: SECTION_IDS.journey, label: "Journey" },
    { id: SECTION_IDS.future, label: "Future Plans" },
  ];

  return (
    <>
      <PageHero {...PAGE_HEROES.about} />
      <div className="about-page">
        <AboutSubNav items={items} />
        <OurStory />
        <MissionVision />
        <FounderSection group="founder" tone={founderTone} />
        <FounderSection group="cofounder" tone={coFounderTone} />
        <CoreTeam tone={coreTone} />
        <Journey />
        <FuturePlans />
      </div>
    </>
  );
};

export default AboutPage;
