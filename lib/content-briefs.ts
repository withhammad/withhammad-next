// ---------------------------------------------------------------------------
// Keyword clusters + seed briefs for the AI draft pipeline.
//
//   npm run draft -- "your topic"      → free-form brief
//   npm run draft -- --brief=aeo-gcc   → one of the seeded briefs below
//
// Topics stay strictly in the AI / marketing / automation lane. Nothing about
// the YouTube channel's content ever becomes a post subject.
// ---------------------------------------------------------------------------

export const KEYWORD_CLUSTERS = {
  primary: [
    "AI Marketing Engineer UAE",
    "AI Marketing Engineer Dubai",
    "AI Automation Expert",
  ],
  longTail: [
    "AI marketing automation Dubai",
    "hire AI automation expert UAE",
    "autonomous Google Ads agent",
    "AI agents for marketing operations",
    "marketing automation consultant GCC",
    "answer engine optimisation UAE",
  ],
} as const;

export type Brief = {
  id: string;
  workingTitle: string;
  targetKeyword: string;
  intent: "informational" | "commercial" | "transactional";
  angle: string;
  mustCover: string[];
  internalLinks: string[];
  cta: string;
};

export const SEED_BRIEFS: Brief[] = [
  {
    id: "autonomous-google-ads-agent",
    workingTitle: "I replaced 9 hours of weekly Google Ads work with an agent",
    targetKeyword: "autonomous Google Ads agent",
    intent: "commercial",
    angle:
      "First-person build log: what the agent actually does each day, the rules it applies, what it refuses to touch, and the honest limits. Lead with the 9h→2h and +18% ROAS numbers.",
    mustCover: [
      "Why weekly account hygiene is the real lever, and why humans skip it",
      "What the agent monitors against live GA4 signals",
      "Guardrails: what it changes automatically vs escalates",
      "The audit trail, and why every change needs a logged reason",
      "What it cannot do — where a human buyer still wins",
    ],
    internalLinks: ["/projects/google-ads-agent", "/projects/jarvis"],
    cta: "Book a call to talk about an agent for your account",
  },
  {
    id: "ai-marketing-automation-dubai",
    workingTitle: "What AI marketing automation actually looks like in Dubai",
    targetKeyword: "AI marketing automation Dubai",
    intent: "commercial",
    angle:
      "Cut through the hype for GCC business owners: separate genuine automation (agents that act) from dashboards that just report. Use real AED figures.",
    mustCover: [
      "The three tiers: reporting, workflow automation, autonomous agents",
      "GCC-specific realities — bilingual audiences, WhatsApp as a sales channel",
      "AED-denominated economics: what a system costs vs what it saves",
      "How to tell a vendor's 'AI' apart from a rules engine",
    ],
    internalLinks: ["/projects", "/projects/ibrahim"],
    cta: "See the systems, then book a call",
  },
  {
    id: "answer-engine-optimisation-uae",
    workingTitle: "Answer engine optimisation: ranking inside ChatGPT and Perplexity",
    targetKeyword: "answer engine optimisation UAE",
    intent: "informational",
    angle:
      "AEO as the successor to rank tracking. Practical, testable steps — not predictions about the future of search.",
    mustCover: [
      "Why citations in answer engines behave differently from blue links",
      "How to measure brand visibility across ChatGPT, Claude, Gemini, Perplexity",
      "Content structures that get quoted",
      "What carries over from classic SEO and what does not",
    ],
    internalLinks: ["/projects/claude-seo-squad", "/blog"],
    cta: "Book a call about an AEO audit",
  },
  {
    id: "hire-ai-automation-expert-uae",
    workingTitle: "Hiring an AI automation expert in the UAE: what to actually test for",
    targetKeyword: "hire AI automation expert UAE",
    intent: "transactional",
    angle:
      "Written for the hiring manager. A screening guide — the questions that separate someone who has shipped agents from someone who has read about them.",
    mustCover: [
      "Portfolio signals that mean something (running systems, not demos)",
      "Questions that expose whether they've handled agent failure modes",
      "Why marketing context matters as much as engineering ability",
      "Realistic scope and timeline for a first production agent",
    ],
    internalLinks: ["/portfolio", "/projects"],
    cta: "Book a call — bring your hardest problem",
  },
  {
    id: "multi-agent-systems-marketing",
    workingTitle: "One agent is a script. Twelve agents is an operating system.",
    targetKeyword: "AI agents for marketing operations",
    intent: "informational",
    angle:
      "Architectural: why multi-agent beats one big prompt, using the Claude SEO Squad (12 agents, 6 brands) and Hermes orchestration as the worked example.",
    mustCover: [
      "Specialist agents vs one generalist prompt — where the latter breaks",
      "Orchestration: goal decomposition and dispatch",
      "Evaluation and self-healing — what happens when an agent is wrong",
      "Where the cost actually goes, and how to keep it sane",
    ],
    internalLinks: ["/projects/claude-seo-squad", "/projects/jarvis"],
    cta: "Book a call to design your agent stack",
  },
];

export const getBrief = (id: string): Brief | undefined =>
  SEED_BRIEFS.find((b) => b.id === id);
