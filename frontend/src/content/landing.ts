/**
 * All landing page copy and data.
 * Sections are presentational — change the content here, not the JSX.
 */

export const nav = [
  { label: "The Gap", href: "#gap" },
  { label: "How It Works", href: "#how" },
  { label: "J-Spotlight", href: "#spotlight" },
  { label: "Tracks", href: "#tracks" },
  { label: "Faculty", href: "#faculty" },
];

export const ticker = [
  "J-Spotlight Edition 01 · 29 Aug 2026",
  "Only 50 seats · invite only",
  "Mentor applications open",
  "Jṉanana Foundation × ISF Junicorns",
  "Gurukul mastery tracks now accepting",
];

export const strip = [
  "Pitch",
  "Connect",
  "Exchange",
  "Explore",
  "Step Into The Light",
];

export const hero = {
  kicker: "Jṉanana Foundation",
  lines: ["THE WORLD'S", "LARGEST", "MENTORSHIP", "PROGRAM"],
  sub: "Great ideas shouldn't stay hidden.",
  lead: "Thousands of people are building something right now — and most of them will never meet the one person who could have shown them the way. Jṉanana exists to close that distance, deliberately, at scale.",
  chips: [
    { label: "Curated matching", tone: "emerald" },
    { label: "Monthly J-Spotlight", tone: "magenta" },
    { label: "Three tracks", tone: "plain" },
    { label: "ISF partnered", tone: "emerald" },
  ] as const,
  sticker: { top: "Edition 01", big: "29 · 08 · 26", bottom: "J-Spotlight" },
};

export const gaps = [
  { n: "01", text: "Share them." },
  { n: "02", text: "Be heard." },
  { n: "03", text: "Meet the right people." },
  { n: "04", text: "Get the right guidance." },
];

export const steps = [
  {
    n: "01 / Join",
    title: "Join",
    body: "Create your profile as a mentee or a mentor. Mentors are reviewed before they appear in discovery.",
  },
  {
    n: "02 / Discover",
    title: "Discover",
    body: "Browse mentors by domain, stage and ambition, and read the background behind each one.",
  },
  {
    n: "03 / Connect",
    title: "Connect",
    body: "Spend Jule Tokens to request mentorship. The mentor accepts, and Jnanana coordinates the connection.",
  },
  {
    n: "04 / Grow",
    title: "Grow",
    body: "Learn, connect and grow through mentorship — measured against the outcome you named.",
  },
];

export const forMentors = {
  eyebrow: "For Mentors",
  title: ["Give the guidance", "you once needed."],
  body: "Your experience placed where it compounds — with none of the coordination.",
  points: [
    "Mentees pre-screened and matched to your domain",
    "Scheduling, agendas and follow-ups handled for you",
    "A standing record of what your guidance produced",
    "Give as little as one hour a week",
  ],
};

export const forMentees = {
  eyebrow: "For Mentees",
  title: ["Learn from someone", "who has done it."],
  body: "Not a course. Not a cohort. A person who has walked your road, in your corner.",
  points: [
    "Matched by where you are, not who you know",
    "A structured track with a defined outcome",
    "Sessions, plans and accountability built in",
    "Return as a mentor when you're ready",
  ],
};

export const spotlightSteps = [
  {
    n: "01",
    title: "Pitch",
    body: "Share what you're building or thinking about — in front of a room that's actually listening.",
  },
  {
    n: "02",
    title: "Connect",
    body: "Meet the people who could become collaborators, co-founders or mentors.",
  },
  {
    n: "03",
    title: "Exchange",
    body: "Get real feedback, honest perspective and the questions you hadn't thought to ask.",
  },
  {
    n: "04",
    title: "Explore",
    body: "Find the opportunity, the introduction or the next step that takes the idea forward.",
  },
];

export const noPrereq = [
  { label: "Building something", hot: false },
  { label: "Solving a problem", hot: true },
  { label: "Exploring an idea", hot: false },
  { label: "Learning something new", hot: true },
  { label: "Looking for people to build with", hot: false },
];

export const eventDetails = [
  { k: "Date", v: "29 August 2026", s: "Saturday" },
  { k: "Time", v: "4:00 – 6:00 PM", s: "Two hours" },
  { k: "Venue", v: "To Be Announced", s: "Shared after confirmation" },
  { k: "Access", v: "Invite Only", s: "Curated room" },
  { k: "Capacity", v: "Only 50 Seats", s: "High value, high impact" },
  { k: "Confirmation", v: "After Pass Purchase", s: "Edition 01" },
];

export const pass = {
  amount: "₹349",
  label: "Event Pass",
  note: "The next Junicorn could be in this room",
  cta: "Book Your Spot",
};

export const chain = [
  "Idea",
  "Conversation",
  "Mentor",
  "Momentum",
  "Impact",
];

/** A body string, or runs where `{ strong }` renders bold. */
export type RichText = string | (string | { strong: string })[];

export const tracks: {
  tag: string;
  title: string;
  pin?: string;
  kick: string;
  body: RichText;
  meta: string;
}[] = [
  {
    tag: "Track 01",
    title: "Jṉanana Gurukul",
    pin: "Invite only",
    kick: "The mastery track.",
    body: "A long-form mentor–shishya relationship for those pursuing depth in a single craft. The oldest teaching model there is, run with modern structure and real accountability.",
    meta: "12 months · Weekly · 1-to-1",
  },
  {
    tag: "Track 02",
    title: "Junicorns",
    kick: "The founder track.",
    body: "Early builders paired with operators who have already built the thing they're attempting — through the first product, the first hires, the first raise. Surfaced through J-Spotlight.",
    meta: "6 months · Fortnightly · 1-to-1 + circle",
  },
  {
    tag: "Track 03 · Partnered",
    title: "ISF",
    kick: "The ecosystem track.",
    // `strong` marks the run rendered bold, matching the source markup.
    body: [
      "Run with the ",
      { strong: "International Startup Foundation" },
      " — the organisation working to strengthen India's startup ecosystem by connecting founders to investors, mentors and opportunity. Their mentors, our structure, your idea.",
    ],
    meta: "Rolling · One hour a week · Mentor network",
  },
];

export const isfPartner = {
  eyebrow: "The Partner",
  title: ["International", "Startup Foundation"],
  body: "ISF works to strengthen India's entrepreneurial ecosystem — connecting startups with the investors, mentors and resources they otherwise never reach. Its stated mission: empower, connect and thrive.",
  points: [
    'A "one hour a week" mentorship model built for busy operators',
    "The Junicorn program — backing entrepreneurs while they're still teenagers",
    "Summits and investor-connect sessions that put founders in the room",
    "A focus on rural entrepreneurship as inclusive growth, not charity",
  ],
};

export const isfWhy = {
  eyebrow: "Why It Matters Here",
  title: ["Structure meets", "reach."],
  body: "Jṉanana brings the mentorship architecture — matching, tracks, cadence, measurement. ISF brings a national network of founders, mentors and investors, and a decade-deep conviction that talent outside the metros deserves the same shot.",
  points: [
    "Mentees reach mentors far beyond their own city",
    "Mentors give in a format that respects their calendar",
    "J-Spotlight becomes the front door to both",
    "The next Junicorn gets found earlier",
  ],
};

export const faculty = [
  { initials: "SR", name: "Siddharth Reddy", role: "Director · Jṉanana Foundation" },
  { initials: "RM", name: "Ravva Madusudan", role: "Mentor · Business Building" },
];

export const domains = [
  {
    title: "Founding & Startups",
    body: "Idea to first revenue, and everything that breaks in between.",
  },
  {
    title: "Product & Engineering",
    body: "Building things that work, and teams that build them.",
  },
  {
    title: "Finance & Capital",
    body: "Fundraising, capital markets and the craft of the deal.",
  },
  {
    title: "Design & Brand",
    body: "Craft, taste, and making the work land with the people it's for.",
  },
  {
    title: "Go-to-Market",
    body: "Sales, distribution and the first thousand customers.",
  },
  {
    title: "Careers & Craft",
    body: "Getting in, getting good, and knowing which room to walk into next.",
  },
];

export const statement = {
  quote: ["Jñāna is not taught.", "It is passed on."],
  who: "The Jṉanana Philosophy",
};

export const footerColumns = [
  {
    title: "Program",
    links: [
      { label: "How It Works", href: "#how" },
      { label: "Jṉanana Gurukul", href: "#tracks" },
      { label: "Junicorns", href: "#tracks" },
      { label: "ISF Track", href: "#tracks" },
    ],
  },
  {
    title: "J-Spotlight",
    links: [
      { label: "What It Is", href: "#spotlight" },
      { label: "Edition 01", href: "#spotlight" },
      { label: "Book a Pass", href: "#spotlight" },
      { label: "The Faculty", href: "#faculty" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Instagram", href: "https://instagram.com/jnanana", external: true },
      {
        label: "LinkedIn",
        href: "https://linkedin.com/company/jnanana",
        external: true,
      },
      { label: "X", href: "https://x.com/jnanana", external: true },
      { label: "hello@jnanana.org", href: "mailto:hello@jnanana.org" },
    ],
  },
];
