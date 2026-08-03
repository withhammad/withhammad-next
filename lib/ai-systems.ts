// ---------------------------------------------------------------------------
// Production AI agents & multi-agent systems.
// Source of truth: Hammad's AI Marketing Automation Engineer CV.
// Rendered on /work (AI Systems section + 3D agent network) and /portfolio.
//
// `status` is deliberate: shipped systems and in-development systems must stay
// visually distinguishable so nothing reads as a live client result when it is
// still being built.
// ---------------------------------------------------------------------------

export type SystemStatus = "production" | "building";

export type AISystem = {
  id: string;
  name: string;
  /** Short label used for the 3D node sprite — keep under ~18 chars. */
  shortName: string;
  role: string;
  summary: string;
  /** Headline outcome. Null when the system has no measured result yet. */
  metric: string | null;
  metricLabel: string | null;
  stack: string[];
  status: SystemStatus;
};

export const AI_SYSTEMS: AISystem[] = [
  {
    id: "printo-lead-engine",
    name: "Printo Lead Engine",
    shortName: "Lead Engine",
    role: "Autonomous multi-agent sales operating system",
    summary:
      "A full autonomous AI operating system built from 11 specialised agents that discover prospects, generate professional AI mockups and brochures, send personalised outreach, classify replies, escalate hot leads, track competitor ads in real time, and self-optimise. Fronted by a cinematic dashboard and “Ibrahim” — a voice-first bilingual AI assistant that drives the entire engine through natural conversation.",
    metric: "11",
    metricLabel: "Specialised agents orchestrated",
    stack: ["Claude Code", "n8n + MCP", "RAG", "Voice AI", "Python"],
    status: "building",
  },
  {
    id: "google-ads-agent",
    name: "Autonomous Google Ads Optimization Agent",
    shortName: "Ads Agent",
    role: "Always-on campaign optimisation",
    summary:
      "A production agent that autonomously monitors campaigns, applies bid, keyword and negative-keyword rules against live GA4 signals, and ships daily optimisation actions without manual review cycles.",
    metric: "+18%",
    metricLabel: "ROAS improvement, quarter over quarter",
    stack: ["Claude Code", "GA4", "Google Ads API", "MCP"],
    status: "production",
  },
  {
    id: "adam-rag",
    name: "“Adam” — RAG Quote & Lead Response Agent",
    shortName: "Adam (RAG)",
    role: "Instant quoting & inbound response",
    summary:
      "A generative AI agent with retrieval over the product knowledge base. It handles web and WhatsApp enquiries, returns instant accurate quotes, and logs conversions automatically — cutting lead response time from hours to seconds.",
    metric: "24/7",
    metricLabel: "Inbound quote coverage",
    stack: ["RAG", "LLM APIs", "WhatsApp Business API", "n8n"],
    status: "production",
  },
  {
    id: "whatsapp-automation",
    name: "WhatsApp Lead-to-Quote Automation",
    shortName: "Lead-to-Quote",
    role: "End-to-end funnel automation",
    summary:
      "Click-to-WhatsApp automation combining n8n + MCP, the WhatsApp Business API and AI to qualify leads, generate quotes and maintain closed-loop attribution back into ad platforms.",
    metric: "Closed-loop",
    metricLabel: "Attribution from click to quote",
    stack: ["n8n + MCP", "WhatsApp Business API", "GA4", "Server-side GTM"],
    status: "production",
  },
  {
    id: "tubepilot",
    name: "TubePilot — YouTube SEO Optimisation Agent",
    shortName: "TubePilot",
    role: "Catalogue-scale content optimisation",
    summary:
      "An autonomous agent that optimises large YouTube catalogues (780+ videos). In a single run it automatically optimised 194 videos across multiple languages, lifting channel SEO health to 59/100.",
    metric: "194",
    metricLabel: "Videos optimised in one autonomous run",
    stack: ["Claude Code", "YouTube Data API", "Multi-language NLP"],
    status: "production",
  },
  {
    id: "aeo-tracker",
    name: "AEO Visibility Tracker",
    shortName: "AEO Tracker",
    role: "Answer-engine brand monitoring",
    summary:
      "Real-time monitoring of brand citations across ChatGPT, Claude, Gemini and Perplexity — measuring visibility in answer engines the way rank tracking measures visibility in search.",
    metric: "4",
    metricLabel: "Answer engines monitored in real time",
    stack: ["Python", "LLM APIs", "Scheduled agents"],
    status: "production",
  },
];

/** Systems currently on the bench — shown as a short "in progress" line. */
export const IN_PROGRESS: string[] = [
  "Campaign Intelligence Agent — automated reporting + recommendations",
  "Smart Budget Allocation & Anomaly Detection Agent",
];

// --- Career facts reused by /portfolio -------------------------------------

export type Role = {
  company: string;
  title: string;
  period: string;
  location: string;
  bullets: string[];
};

export const ROLES: Role[] = [
  {
    company: "Printo — Rainbow Printing Industries",
    title: "AI Marketing Automation Engineer (Performance Marketing Focus)",
    period: "July 2024 — Present",
    location: "Dubai, UAE",
    bullets: [
      "Designed, built and operate multiple production AI agents using Claude Code and n8n + MCP that autonomously manage bid, keyword and negative-keyword optimisation — cutting manual weekly optimisation time by over 75% while delivering +18% ROAS improvement.",
      "Scaled Google Ads Search and Performance Max to 3,750 conversions on AED 42K spend through Smart Bidding, extensive RSA experimentation and AI-assisted audience and creative optimisation. Top responsive search ad achieved 5.83% CTR across 82,000+ impressions.",
      "Implemented GA4 + server-side GTM attribution infrastructure, including HubSpot offline conversion uploads and Looker Studio dashboards, which identified and reallocated AED 11K per month of misallocated spend to higher-LTV categories.",
      "Shipped marketing automation workflows (n8n, Zapier, MCP) and the “Adam” RAG quote bot handling ad copy, audience signals, reporting and inbound lead pricing.",
    ],
  },
  {
    company: "Good Morning Property Real Estate",
    title: "Performance Marketing Specialist",
    period: "November 2023 — June 2024",
    location: "Dubai, UAE",
    bullets: [
      "Launched and scaled a full-funnel Meta Ads strategy (Click-to-WhatsApp + Lead Generation) delivering 80 qualified buyer leads in 30 days at AED 76.38 CPL on AED 5,448 spend.",
      "Built 12 high-quality audience segments (custom, lookalike and interest-based) and ran rigorous AI-assisted A/B testing across creatives, copy variants and headlines while protecting lead quality through the sales handoff.",
      "Implemented GA4 tracking and attribution to optimise toward qualified lead volume while holding CPA targets.",
    ],
  },
  {
    company: "ICON Ad Agency",
    title: "Performance Marketing Specialist",
    period: "November 2021 — October 2023",
    location: "Dubai, UAE",
    bullets: [
      "Managed paid media across Google Ads, Meta, TikTok and Snapchat for 10+ clients spanning Automotive, Technology, E-commerce, Healthcare, FMCG and Banking.",
      "Achieved +30% average CTR and −22% CPA through systematic creative and audience A/B testing, forecasting budgets within 5% of quarterly targets.",
      "Automated approximately 80% of recurring campaign operations using Zapier and custom GPT scripts.",
      "Grew organic traffic +45% through AI-assisted content strategy (SurferSEO) and technical SEO audits. Awarded Employee of the Month.",
    ],
  },
  {
    company: "Deewan Equipment Trading",
    title: "Digital Marketing Specialist",
    period: "January 2020 — October 2021",
    location: "Dubai, UAE",
    bullets: [
      "Directed B2B paid search and lead generation across Google Ads and LinkedIn Ads targeting industrial machinery buyers in UAE, KSA, Qatar and Bahrain.",
      "Grew qualified leads +30% and reduced CPA by 28% through targeted bidding strategies and audience refinement.",
      "Combined PPC retargeting with on-page and technical SEO to increase sales quote requests by +20%.",
      "Rebuilt the company website on WordPress + Elementor, improving landing page conversion rates.",
    ],
  },
];

export const SKILL_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Agentic AI & Multi-Agent Systems",
    items: [
      "Production AI agents",
      "Multi-agent orchestration",
      "Claude Code & Computer Use",
      "n8n + Model Context Protocol (MCP)",
      "RAG systems",
      "LLM API integration (Anthropic, Groq, OpenAI)",
      "Event-driven architecture",
      "Agent evaluation & self-healing",
    ],
  },
  {
    title: "Performance Marketing & Growth",
    items: [
      "Google Ads (Search, Performance Max, Demand Gen, Smart Bidding)",
      "Meta Ads & Advantage+",
      "TikTok & Snapchat Ads",
      "Full-funnel strategy",
      "CRO & experimentation",
      "GA4 + server-side tracking",
      "Advanced attribution",
    ],
  },
  {
    title: "AI Development & Infrastructure",
    items: [
      "Next.js + TypeScript",
      "Python (Flask/FastAPI)",
      "Three.js / React Three Fiber",
      "Playwright automation",
      "SDXL + custom visual pipelines",
      "Voice AI (ElevenLabs)",
      "Google Places API",
    ],
  },
];

export const CERTIFICATIONS: string[] = [
  "Google AI Professional Certificate",
  "Google Ads AI-Powered Performance",
  "Google Analytics 4 (GA4)",
  "Google Digital Marketing & E-commerce",
  "Meta Social Media Marketing Professional",
  "IBM Data Science Professional Certificate",
  "One Million Prompters — AI Prompt Engineering (Dubai Future Foundation)",
];

export const LANGUAGES: string[] = [
  "English (Professional)",
  "Urdu (Native)",
  "Hindi (Conversational)",
  "Arabic (Basic)",
];
