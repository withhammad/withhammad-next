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
  {
    id: "ai-marketing-engineer-uae",
    workingTitle: "What an AI Marketing Engineer actually does (and why the title exists)",
    targetKeyword: "AI Marketing Engineer UAE",
    intent: "informational",
    angle:
      "Define the role honestly. It is not a marketer who uses ChatGPT and it is not a backend engineer who read a growth book — it is the person who builds the systems that run marketing. Use the career arc as the worked example.",
    mustCover: [
      "The gap between 'uses AI tools' and 'builds AI systems'",
      "What the day actually looks like: shipping agents, not writing prompts",
      "Why marketing context is non-negotiable — an engineer who has never owned a CPA target builds the wrong thing",
      "How the role emerged from performance marketing, not from software",
    ],
    internalLinks: ["/portfolio", "/projects"],
    cta: "Book a call if this is the role you're trying to fill",
  },
  {
    id: "ai-automation-expert-what-to-expect",
    workingTitle: "Working with an AI automation expert: scope, timeline, and what breaks",
    targetKeyword: "AI Automation Expert",
    intent: "commercial",
    angle:
      "Set expectations properly. What a first engagement covers, how long a production agent really takes, and the failure modes nobody warns you about.",
    mustCover: [
      "Discovery: finding the workflow worth automating (usually not the one you'd guess)",
      "Realistic timeline from brief to a running agent",
      "Failure modes: silent drift, hallucinated actions, cost blowups — and the guardrails for each",
      "What stays human, permanently",
    ],
    internalLinks: ["/projects/ibrahim", "/contact"],
    cta: "Book a call to scope your first agent",
  },
  {
    id: "whatsapp-lead-automation-gcc",
    workingTitle: "WhatsApp is the GCC sales channel — automate it properly",
    targetKeyword: "AI marketing automation Dubai",
    intent: "commercial",
    angle:
      "Region-specific and practical. In the Gulf, WhatsApp is where deals actually happen. Cover click-to-WhatsApp funnels, instant quoting, and closed-loop attribution back to ad platforms.",
    mustCover: [
      "Why Click-to-WhatsApp outperforms form fills in GCC markets",
      "Instant quoting with a retrieval agent over a real product catalogue",
      "Closing the attribution loop so ad platforms can optimise on real outcomes",
      "Bilingual handling, and where it goes wrong",
    ],
    internalLinks: ["/projects/adam", "/work/good-morning-property"],
    cta: "Book a call about your WhatsApp funnel",
  },
  {
    id: "ga4-server-side-attribution",
    workingTitle: "Your reporting is lying: fixing attribution with GA4 and server-side GTM",
    targetKeyword: "AI marketing automation Dubai",
    intent: "informational",
    angle:
      "Attribution as the precondition for any automation. An agent optimising against broken data optimises confidently in the wrong direction. Use the AED 11K/month reallocation as the proof.",
    mustCover: [
      "The symptoms of broken tracking (WhatsApp taps counted as purchases, etc.)",
      "GA4 + server-side GTM as the fix, in plain terms",
      "Offline conversion uploads so CRM outcomes reach the ad platform",
      "Why agents amplify bad data instead of correcting it",
    ],
    internalLinks: ["/work/printo", "/projects/google-ads-agent"],
    cta: "Book a call for a tracking audit",
  },
  {
    id: "build-vs-buy-marketing-ai",
    workingTitle: "Build or buy: when a marketing AI tool is enough, and when it isn't",
    targetKeyword: "hire AI automation expert UAE",
    intent: "commercial",
    angle:
      "An honest decision framework, including the cases where buying a SaaS tool is the right answer. Credibility comes from arguing against yourself.",
    mustCover: [
      "Where off-the-shelf genuinely wins (commodity workflows, low volume)",
      "Where custom wins: your data, your rules, your unit economics",
      "The real cost of custom — maintenance, not the build",
      "A short test to decide in an afternoon",
    ],
    internalLinks: ["/projects", "/contact"],
    cta: "Book a call and pressure-test the decision",
  },
  {
    id: "agent-guardrails-production",
    workingTitle: "Guardrails: what stops an AI agent doing something expensive",
    targetKeyword: "AI agents for marketing operations",
    intent: "informational",
    angle:
      "The engineering half nobody writes about. Spend caps, escalation rules, audit trails, and rollback — the difference between a demo and production.",
    mustCover: [
      "Bounded autonomy: what the agent may change without asking",
      "Escalation paths and why a human queue is a feature",
      "Audit trails — every change with a logged reason",
      "Cost controls and anomaly detection",
    ],
    internalLinks: ["/projects/atlas", "/projects/google-ads-agent"],
    cta: "Book a call to design your guardrails",
  },
  {
    id: "seo-content-at-portfolio-scale",
    workingTitle: "Running SEO for six brands without a content team",
    targetKeyword: "AI Automation Expert",
    intent: "commercial",
    angle:
      "The Claude SEO Squad as a case study in scaling a discipline with agents: what was automated, what stayed manual, and the quality gate that keeps it publishable.",
    mustCover: [
      "Splitting SEO into agent-sized jobs: research, drafting, auditing, optimising",
      "The human approval gate and why removing it destroys quality",
      "Measuring whether the output actually ranks",
      "Where the cost sits at this scale",
    ],
    internalLinks: ["/projects/claude-seo-squad", "/blog"],
    cta: "Book a call about your content operation",
  },
];

export const getBrief = (id: string): Brief | undefined =>
  SEED_BRIEFS.find((b) => b.id === id);
