// ---------------------------------------------------------------------------
// AI systems, DERIVED from lib/projects.ts — one source of truth for the 8
// missions. This module keeps its old shape so the 3D agent network and the
// /portfolio page don't need rewriting: `shortName` (<=18 chars) labels the
// sprites, and `status` stays load-bearing so in-development work can never
// read as a shipped client result.
// ---------------------------------------------------------------------------

import { PROJECTS } from "@/lib/projects";

export type SystemStatus = "production" | "building";

export type AISystem = {
  id: string;
  name: string;
  shortName: string;
  role: string;
  summary: string;
  metric: string | null;
  metricLabel: string | null;
  stack: string[];
  status: SystemStatus;
};

export const AI_SYSTEMS: AISystem[] = PROJECTS.map((p) => ({
  id: p.slug,
  name: p.name,
  shortName: p.shortName,
  role: p.oneLiner.split("—")[0].trim(),
  summary: p.oneLiner,
  metric: p.metric,
  metricLabel: p.metricLabel,
  stack: p.stack,
  // "deployed" is a shipped state for display purposes
  status: p.status === "building" ? "building" : "production",
}));

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
