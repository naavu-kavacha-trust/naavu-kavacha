/**
 * The words of the Privacy Policy and the Terms of Service (pages /privacy and /terms).
 *
 * Written for what this website actually does today:
 *  - it has one form (volunteer registration) and an email chooser; it has no accounts, payments or donations;
 *  - it sets no cookies of its own and has no analytics or advertising tools;
 *  - it loads its two fonts from Google Fonts;
 *  - it shows photographs of events and (with consent) the names, roles, photos and bios of team members.
 *
 * If any of that changes (analytics, donations, a new form, a new service provider), update this file in the same
 * change. Registration number, registered address and the contact person's name are optional and live in
 * `LEGAL_DETAILS` in `siteConfig.ts`; they appear only once filled in.
 *
 * This is a plain-language draft prepared for the Trust. It is not legal advice: have a lawyer who knows Indian
 * charity and data-protection law read it before it is relied on.
 *
 * Style: short sentences, no legal Latin, because many of the people reading it are students.
 * Each `{email}` is replaced with the contact address from `siteConfig.ts`.
 */

export interface LegalSection {
  /** Used for the link in the contents list and for #deep links. */
  id: string;
  heading: string;
  /** Paragraphs shown first. */
  paragraphs?: string[];
  /** A bulleted list shown after the paragraphs. */
  items?: string[];
  /** Paragraphs shown after the list. */
  after?: string[];
}

export interface LegalDocument {
  /** One short paragraph at the top, before the contents list. */
  intro: string[];
  sections: LegalSection[];
}

export const privacyPolicy: LegalDocument = {
  intro: [
    "This policy explains what personal information Naavu Kavacha Trust (\"the Trust\", \"we\", \"us\") collects through this website, why we collect it, who sees it, how long we keep it and what choices you have.",
    "We are a small, student-driven environmental group. We collect as little as we can, we do not sell anything, and we only use your details for the reasons given below.",
  ],
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are",
      paragraphs: [
        "Naavu Kavacha Trust is a registered trust based in Karnataka, India. It runs Naavu Kavacha, a student-driven environmental initiative (seed collection, seedballs, plantation drives, clean-ups, bamboo bird feeders, Growing Ganesha idols and school awareness programmes).",
        "The Trust decides why and how the personal information described here is used. For anything in this policy, write to {email}.",
      ],
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      paragraphs: ["We collect information in three ways."],
      items: [
        "Volunteer registration form. If you fill in the form on the Volunteer page we receive your name, email address, mobile number, the areas you would like to help with and when you are usually free. If you choose to, you can also give your college or organisation and write a message. We also record that you agreed to be contacted, and the date and time you submitted the form.",
        "Emails and messages. If you email us (including through the \"Email Us\" or \"Partner Up\" buttons), we receive what you write and your email address. If you message us on Instagram or join our WhatsApp channel, that happens on those services; see \"Other websites and services\" below.",
        "Technical information. Like every website, the service that hosts this site may automatically log your IP address, the type of browser and device you use, and the pages you open. We do not use this to identify you.",
      ],
      after: [
        "We do not ask for, and you should not send us, bank details, Aadhaar or other government ID numbers, passwords or anything about your health or religion. The site has no accounts, takes no payments and does not accept donations.",
      ],
    },
    {
      id: "why-we-use-it",
      heading: "Why we use it",
      paragraphs: ["We use your information only for these purposes:"],
      items: [
        "to get in touch with you about volunteering, such as telling you about the next drive, workshop or school visit;",
        "to plan events (for example, how many people to expect and which activities people prefer);",
        "to reply to your email or message;",
        "to keep the site working and safe;",
        "to meet legal duties, if the law ever requires us to.",
      ],
      after: [
        "We do not use your details for advertising, we do not sell or rent them, and we do not make decisions about you by computer. We will ask you again before using your details for anything that is not on this list.",
      ],
    },
    {
      id: "consent",
      heading: "Your agreement",
      paragraphs: [
        "When you tick the box on the volunteer form you agree that we may contact you about volunteering with Naavu Kavacha. That is the basis on which we use the details you give us there. You can withdraw your agreement at any time (see \"Your choices and rights\"). Withdrawing does not undo what we did before you withdrew, and it may mean we can no longer include you in volunteer plans.",
        "For anything you send us by email, we use your details to reply to you.",
      ],
    },
    {
      id: "children",
      heading: "Young people",
      paragraphs: [
        "Many of our volunteers are students, and some are under 18. If you are under 18, please ask a parent or guardian to fill in the form with you or to approve it first, and give us their agreement if we ask for it. We will not knowingly keep the details of a person under 18 without a parent's or guardian's agreement, and we do not track or advertise to children.",
        "Photographs and videos at our events are covered in the next section.",
      ],
    },
    {
      id: "photos",
      heading: "Photographs and people on this site",
      paragraphs: [
        "We take photographs at our activities and show some of them on this website and on our social media. We show a team member's name, role, photograph and short biography only when that person (or a parent or guardian, if they are under 18) has agreed.",
        "We ask schools and parents for agreement before publishing photographs in which students can be identified. If you or your child appears in a photograph and you would like it taken down or the caption changed, email {email} with a link to the page and we will act on it promptly.",
      ],
    },
    {
      id: "who-sees-it",
      heading: "Who can see your information",
      paragraphs: [
        "Your details are seen by the Trust's trustees and the volunteers who coordinate events and are asked to keep them private. We share them with other people only in these cases:",
      ],
      items: [
        "Service providers who help us run the site and collect forms, such as our web host, the tool that stores form submissions (for example a private online spreadsheet) and our email provider. They may only use the information to provide that service to us.",
        "Authorities, if the law requires it or if it is needed to protect someone's safety.",
        "A school or partner organisation, only when you have asked to volunteer through them or at an event with them, and only what they need.",
      ],
      after: [
        "Some of these providers keep information on servers outside India. We choose providers carefully and share the minimum needed. We never publish your registration details.",
      ],
    },
    {
      id: "how-the-form-works",
      heading: "How the volunteer form sends your details",
      paragraphs: [
        "Depending on how the site is set up at the time, pressing the button either (a) sends your details directly to the Trust's private collection point, or (b) opens an email in your own email app or Gmail with your details already filled in. In case (b) nothing is sent to us until you press send in your email. The page tells you which of the two is happening.",
        "A hidden field on the form is there only to catch automated spam. It is not stored.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and tracking",
      paragraphs: [
        "This site does not set cookies of its own, and it does not use advertising or analytics tools. It loads two typefaces from Google Fonts, so your browser asks Google's servers for those font files and Google can see your IP address when it does. If we add analytics in the future, we will say so here first.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      paragraphs: [
        "We keep your registration for as long as you are an active or interested volunteer, and for a reasonable time after that so that you can come back easily. We review our volunteer list at least once a year and delete details of people who are no longer in touch. Emails are kept for as long as we need them to deal with what you asked. We delete or anonymise your details sooner if you ask us to, unless the law requires us to keep them.",
      ],
    },
    {
      id: "security",
      heading: "Keeping your information safe",
      paragraphs: [
        "We keep volunteer details in access-controlled accounts, share them only with the people who need them and ask those people to keep them private. No website or storage service is completely secure, so we cannot promise that nothing will ever go wrong. If a problem affects your personal information, we will tell you and the authorities as the law requires.",
      ],
    },
    {
      id: "your-rights",
      heading: "Your choices and rights",
      paragraphs: ["You can ask us, at any time, to:"],
      items: [
        "tell you what information we hold about you and what we use it for;",
        "correct anything that is wrong or out of date;",
        "delete your information;",
        "stop contacting you, or withdraw your agreement to be contacted;",
        "take down a photograph of you or your child.",
      ],
      after: [
        "Email {email} from the address you registered with, or tell us the email address or number you used. We may need to check it is really you. We will reply as soon as we reasonably can, and always within the time the law allows. If you are not happy with our answer, you can complain to the authority named in the law that applies to you.",
      ],
    },
    {
      id: "other-sites",
      heading: "Other websites and services",
      paragraphs: [
        "This site links to Instagram and WhatsApp, and the email buttons may open Gmail or your email app. These services have their own rules and privacy policies, and what you share on them is handled by them, not by us. We are not responsible for them. Please read their policies before using them.",
      ],
    },
    {
      id: "law",
      heading: "The law that applies",
      paragraphs: [
        "We handle personal information in line with the laws of India that apply to us, including the Information Technology Act, 2000 and its rules, and the Digital Personal Data Protection Act, 2023 as its provisions come into force.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      paragraphs: [
        "We may update this policy, for example if we add a new tool or the law changes. The date at the top shows when it was last changed. If we make an important change to how we use your details, we will tell volunteers by email or on this page before the change takes effect.",
      ],
    },
    {
      id: "contact-us",
      heading: "Contact us",
      paragraphs: [
        "For questions about this policy, to use any of your rights above, or to raise a concern, write to {email}.",
      ],
    },
  ],
};

export const termsOfService: LegalDocument = {
  intro: [
    "These terms explain the rules for using this website and for volunteering with Naavu Kavacha. By using the site you agree to them. If you do not agree, please do not use it.",
    "\"The Trust\", \"we\" and \"us\" mean Naavu Kavacha Trust. \"You\" means anyone who visits the site or registers to volunteer.",
  ],
  sections: [
    {
      id: "about-us",
      heading: "About these terms",
      paragraphs: [
        "This website is run by Naavu Kavacha Trust, a registered trust based in Karnataka, India. It is meant to tell people about our work and to let people offer their time as volunteers. Our Privacy Policy explains how we handle your personal information and forms part of these terms.",
      ],
    },
    {
      id: "using-the-site",
      heading: "Using the site",
      paragraphs: ["You may use the site for lawful, personal and community purposes. Please do not:"],
      items: [
        "use it to break any law or to harass, mislead or harm anyone;",
        "send us false or someone else's details, or fill in the form for a person who has not agreed;",
        "try to break into, overload or interfere with the site or its forms, or send automated or spam submissions;",
        "copy the site to pretend to be the Trust or to collect money or personal information in our name.",
      ],
      after: [
        "If you are under 18, ask a parent or guardian before you register or share your details, and make sure they are happy with you using the site.",
      ],
    },
    {
      id: "volunteering",
      heading: "Volunteering",
      paragraphs: [
        "Registering on the site tells us you are interested. It does not guarantee a place at any activity, and it does not create a job, an employment or agency relationship, or any right to payment. Volunteering with us is voluntary and unpaid. We may decide who takes part in an activity depending on numbers, age, safety, location and the needs of the event.",
        "You can stop volunteering at any time. We may ask someone to stop, or not invite them again, if their behaviour puts others, the environment or the Trust's reputation at risk.",
      ],
    },
    {
      id: "safety",
      heading: "Safety at our activities",
      paragraphs: [
        "Our activities take place outdoors and in schools and public places: planting, collecting seeds, clean-ups near lakes and forests, and workshops with tools. If you take part:",
      ],
      items: [
        "follow the instructions of the organisers, teachers and any local authority;",
        "wear suitable clothing and footwear, and look after your own belongings;",
        "tell an organiser if you are unwell, injured or uncomfortable, or if you see something unsafe;",
        "treat people, places, plants and animals with care, and do not take anything from a site unless you were asked to;",
        "if you are under 18, take part only with the permission of a parent or guardian and, for school events, your school.",
      ],
      after: [
        "We plan activities with care, but outdoor work carries some risk. We may ask you or your parent or guardian to sign a separate consent or safety form for a particular event.",
      ],
    },
    {
      id: "what-we-publish",
      heading: "What this site says",
      paragraphs: [
        "We try to keep everything on the site accurate and up to date. The figures we show (for example seeds collected or saplings planted) are our own counts and are rounded or marked as approximate where we are not certain. The site is for general information; dates, places and activities can change, and we do not promise that every page is complete or free of mistakes. If you notice something wrong, please tell us at {email}.",
      ],
    },
    {
      id: "ownership",
      heading: "Content and ownership",
      paragraphs: [
        "The text, photographs, name, logo and design of this site belong to the Trust or to the people who made them and allowed us to use them. You may share a page link and may quote a short part of the text with a clear credit to Naavu Kavacha, for example in a school project or a news item, as long as you do not change the meaning. You may not copy the site or its photographs for commercial use, sell them, or use our name or logo in a way that suggests we have approved you, without our written permission. Write to {email} to ask.",
      ],
    },
    {
      id: "what-you-send",
      heading: "What you send us",
      paragraphs: [
        "If you send us photographs, text or other material (for example photographs from an event for our gallery), you confirm that you made it or have the right to share it, and that anyone clearly shown in it, or their parent or guardian, is happy for us to use it. You allow the Trust to use it, free of charge and without an end date, on this site, on our social media and in our reports and awareness material, with a credit if you ask for one. You keep ownership, and you can ask us to remove it at any time by emailing {email}; we will remove it from places we control, though we cannot always remove copies others have already shared.",
      ],
    },
    {
      id: "other-sites",
      heading: "Links to other websites",
      paragraphs: [
        "The site links to other services such as Instagram and WhatsApp. They are run by other companies under their own terms. We do not control them and are not responsible for what they contain or do. A link is not an endorsement.",
      ],
    },
    {
      id: "no-donations",
      heading: "Money and donations",
      paragraphs: [
        "This site does not collect payments or donations. Please do not send money to anyone in the Trust's name because of something you saw on this site. If we start to accept donations or fees in future, we will publish the details and the terms that apply here.",
      ],
    },
    {
      id: "availability",
      heading: "Keeping the site running",
      paragraphs: [
        "We try to keep the site available but we do not promise that it will always work or be free of errors or viruses. We may change, pause or remove any part of it, and we may update these terms.",
      ],
    },
    {
      id: "liability",
      heading: "Our responsibility",
      paragraphs: [
        "We provide this site and our activities in good faith. To the extent the law allows, the Trust and the people who run it are not responsible for losses or damage that arise from using the site or from relying on its information, or for things outside our reasonable control, including the actions of other people, the weather, and the content of other websites. Nothing in these terms limits any responsibility that the law does not allow to be limited, including for death or personal injury caused by negligence or for fraud.",
      ],
    },
    {
      id: "law",
      heading: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of India. If there is a disagreement that we cannot sort out by talking, the courts located in Karnataka, India will have jurisdiction.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to these terms",
      paragraphs: [
        "We may change these terms from time to time. The date at the top shows when they were last changed. If you keep using the site after a change, you accept the new terms. If a change is important to volunteers, we will tell them by email or on this site first.",
      ],
    },
    {
      id: "contact-us",
      heading: "Contact us",
      paragraphs: ["Questions about these terms can be sent to {email}."],
    },
  ],
};

/** Titles and descriptions for the legal pages (same rules as `PAGE_META` in `siteConfig.ts`; kept here so they stay out of the home page's code). */
export const LEGAL_PAGE_META = {
  privacy: {
    title: "Privacy Policy | Naavu Kavacha Trust",
    description:
      "What personal information Naavu Kavacha Trust collects through this website, why, who sees it, how long we keep it and your choices.",
  },
  terms: {
    title: "Terms of Service | Naavu Kavacha Trust",
    description:
      "The rules for using the Naavu Kavacha website and for volunteering with Naavu Kavacha Trust, in plain language.",
  },
} as const;

export const LEGAL_PAGE_HEROES = {
  privacy: {
    eyebrow: "Naavu Kavacha Trust",
    title: "Privacy Policy",
    description: "What we collect, why we collect it and the choices you have.",
  },
  terms: {
    eyebrow: "Naavu Kavacha Trust",
    title: "Terms of Service",
    description: "The rules for using this site and for volunteering with us, in plain language.",
  },
} as const;
