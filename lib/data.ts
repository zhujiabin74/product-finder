export type Terms = {
  fee: number;
  deliverable: string;
  deadline: string;
  usageRights: string;
  keepSample: boolean;
};

export type Campaign = {
  brand: string;
  product: string;
  sku: string;
  category: string;
  pitch: string;
  compatibility: string;
  samples: number;
  shipTo: string;
  type: "Brand-owned content" | "Sponsored post";
  openingTerms: Terms;
  maxFee: number;
  goals: string[];
};

export type Creator = {
  id: string;
  handle: string;
  name: string;
  platform: "TikTok" | "YouTube Shorts";
  followers: number;
  followersSource: string;
  avgViews: number;
  niche: string[];
  audience: string;
  avatar: string;
  portfolio: { title: string; url: string; views: number; date: string }[];
  matchReasons: string[];
  matchScore: number;
  // Private negotiation limits, visible only to the creator's own agent
  minFee: number;
  priorities: string;
  personality: string;
};

export const campaign: Campaign = {
  brand: "Hushwerk",
  product: "Hushwerk Q1 Silent Mechanical Keyboard",
  sku: "HW-Q1-75-SLT",
  category: "Keyboards",
  pitch:
    "75% hot-swap mechanical keyboard with pre-lubed silent linear switches, 28 dB typing noise. Built for shared offices and late-night calls.",
  compatibility: "macOS / Windows, USB-C + Bluetooth 5.3",
  samples: 5,
  shipTo: "United States",
  type: "Brand-owned content",
  openingTerms: {
    fee: 400,
    deliverable: "1 vertical first-impressions video (45–60s) incl. sound test",
    deadline: "Dec 5, 2026",
    usageRights: "Organic + paid ads, 6 months",
    keepSample: true,
  },
  maxFee: 750,
  goals: [
    "Show the sound difference vs. a typical clicky board",
    "Reach remote workers in shared homes",
    "Usable as a paid ad on Meta + TikTok for launch week",
  ],
};

export const funnel = [
  { label: "Applications received", count: 1247 },
  { label: "Ships to U.S. + vertical format", count: 892 },
  { label: "≥3 relevant videos in 90 days", count: 214 },
  { label: "You.com portfolio + reputation check", count: 37 },
  { label: "Shortlisted for agent negotiation", count: 3 },
];

export const creators: Creator[] = [
  {
    id: "maya",
    handle: "@deskbymaya",
    name: "Maya Chen",
    platform: "TikTok",
    followers: 38200,
    followersSource: "TikTok profile, Nov 20 2026",
    avgViews: 21000,
    niche: ["desk setups", "quiet keyboards", "WFH aesthetics"],
    audience: "25–34, U.S., remote workers, 62% apartment dwellers",
    avatar: "MC",
    portfolio: [
      { title: "Quietest keyboards for roommates (sound test)", url: "#", views: 184000, date: "Oct 30" },
      { title: "My $300 small-apartment desk setup", url: "#", views: 92000, date: "Oct 11" },
      { title: "Lubing switches for silence — before/after", url: "#", views: 61000, date: "Sep 2" },
    ],
    matchReasons: [
      "Her “quietest keyboards for roommates” sound test (184K views) is the exact angle of this launch",
      "Audience skews remote workers in shared housing",
    ],
    matchScore: 96,
    minFee: 550,
    priorities: "Wants a fair fee and to limit paid-ad usage to 3 months. Will keep the sample. Needs at least until Dec 8 because of another deal.",
    personality: "Warm, confident, knows her rates.",
  },
  {
    id: "jordan",
    handle: "@clackless",
    name: "Jordan Reyes",
    platform: "YouTube Shorts",
    followers: 24600,
    followersSource: "YouTube Studio screenshot, self-reported, Nov 18 2026",
    avgViews: 15500,
    niche: ["mechanical keyboards", "switch reviews", "sound comparisons"],
    audience: "18–29, U.S., keyboard hobbyists",
    avatar: "JR",
    portfolio: [
      { title: "Silent linear switches ranked by sound", url: "#", views: 77000, date: "Nov 4" },
      { title: "Hot-swap 75% boards under $150", url: "#", views: 54000, date: "Oct 20" },
      { title: "Typing ASMR: 5 boards, 1 mic", url: "#", views: 49000, date: "Sep 28" },
    ],
    matchReasons: [
      "Ranked silent linear switches by sound 18 days ago (77K views)",
      "Records consistent mic-level sound comparisons",
    ],
    matchScore: 91,
    minFee: 380,
    priorities: "Flexible on fee, but wants creative freedom to mention one con honestly and a 2-day extension.",
    personality: "Nerdy, detail-oriented, cares about honest reviews.",
  },
  {
    id: "priya",
    handle: "@priyaworksfromhome",
    name: "Priya Nair",
    platform: "TikTok",
    followers: 8900,
    followersSource: "TikTok profile, Nov 21 2026",
    avgViews: 11200,
    niche: ["productivity", "home office", "late-night routines"],
    audience: "22–35, U.S., night-shift and hybrid workers",
    avatar: "PN",
    portfolio: [
      { title: "My 2am work routine without waking my partner", url: "#", views: 143000, date: "Nov 9" },
      { title: "Desk upgrades that actually help focus", url: "#", views: 38000, date: "Oct 15" },
      { title: "Quiet tech for shared bedrooms", url: "#", views: 26000, date: "Sep 19" },
    ],
    matchReasons: [
      "Her “2am routine without waking my partner” video (143K views) shows the late-night use case",
      "Nano creator with views above follower count: strong for brand-owned ads",
    ],
    matchScore: 88,
    minFee: 300,
    priorities: "Happy with the brief. Wants the fee paid within 7 days of approval instead of net-30.",
    personality: "Upbeat, newer to brand deals, careful about payment terms.",
  },
];
