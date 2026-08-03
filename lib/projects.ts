// ---------------------------------------------------------------------------
// The 8 missions — single source of truth for every project surface:
// mission-select index, /projects/[slug] case studies, terminal demos, the
// JARVIS scroll-story, and the 3D agent network (via lib/ai-systems.ts).
//
// Copy rules: hook + proof + CTA. Verified numbers only — anything needing
// Hammad's confirmation is marked TODO. `status` is load-bearing: nothing in
// development may read as a shipped client result.
// ---------------------------------------------------------------------------

export type ProjectStatus = "production" | "deployed" | "building";

export type TerminalLine = {
  kind: "cmd" | "out" | "ok" | "warn" | "sys";
  text: string;
};

export type Project = {
  slug: string;
  /** Key into lib/case-links.ts */
  linkKey: string;
  codename: string;
  name: string;
  oneLiner: string;
  role: string;
  year: string;
  status: ProjectStatus;
  stack: string[];
  /** ≤18 chars — 3D node sprite label */
  shortName: string;
  metric: string | null;
  metricLabel: string | null;
  problem: string;
  system: string[];
  results: string[];
  pullStats: { value: string; label: string }[];
  terminal?: { title: string; lines: TerminalLine[] };
};

export const PROJECTS: Project[] = [
  {
    slug: "jarvis",
    linkKey: "jarvis",
    codename: "M-01",
    name: "JARVIS",
    shortName: "JARVIS",
    oneLiner: "A full AI operating system — autonomous SEO engine, voice layer, and an orchestrator commanding a squad of sub-agents.",
    role: "Architect & engineer",
    year: "2025—",
    status: "building",
    stack: ["Claude Code", "Node.js", "Voice AI", "Multi-agent orchestration", "SEO APIs"],
    metric: "1",
    metricLabel: "Operating system, many agents",
    problem:
      "SEO at portfolio scale is a toolstack problem: rank trackers, crawlers, content tools, reporting dashboards — each with a subscription, a login, and a human gluing them together. The glue is the job. Hammad wanted the glue to be software.",
    system: [
      "JARVIS is built as an operating system, not a script. At its heart sits Hermes — an orchestrator that receives goals, decomposes them into missions, and dispatches a squad of specialised sub-agents: crawlers that audit sites, analysts that read rankings, writers that draft content, reviewers that gate quality.",
      "An autonomous SEO engine replaces the paid toolstack: crawling, ranking analysis, and content operations run as scheduled agent missions with results logged and diffed over time.",
      "A voice layer sits on top, so the entire system can be commanded and queried in natural conversation — status reports, mission launches, and summaries, spoken.",
    ],
    results: [
      "Autonomous SEO engine operational across Hammad's own web properties — TODO: add the current property count and a before/after ranking screenshot.",
      "Hermes orchestrator routinely runs multi-agent missions end-to-end without intervention.",
      "In active development toward client-facing deployment.",
    ],
    pullStats: [
      { value: "4", label: "Layers: engine, voice, orchestrator, agents" },
      { value: "24/7", label: "Mission scheduling, unattended" },
    ],
  },
  {
    slug: "ibrahim",
    linkKey: "ibrahim",
    codename: "M-02",
    name: "IBRAHIM",
    shortName: "IBRAHIM",
    oneLiner: "An autonomous B2B sales outreach agent with a cinematic command centre — prospecting to follow-up, end to end.",
    role: "Architect & engineer",
    year: "2025—",
    status: "production",
    stack: ["Claude Code", "Python", "Playwright", "Gmail API", "Voice AI"],
    metric: "150/day",
    metricLabel: "Personalised outreach capacity",
    problem:
      "A real printing business needed a B2B pipeline, but outreach done properly — research the prospect, personalise the message, follow up on time, classify every reply — consumes a full-time human. Done cheaply, it's spam. The business needed the quality of a diligent SDR at the cost of a server.",
    system: [
      "IBRAHIM discovers prospects (including a native maps scraper that grid-searches whole districts), enriches them, and generates personalised outreach — with AI-designed mockups attached, gated by an art-director QA agent so nothing below agency-grade ever ships.",
      "Replies flow back through a classifier: interested, not-now, unsubscribe, bounce. Hot leads escalate to a human instantly; dead addresses auto-suppress; everything else is scheduled for follow-up.",
      "A voice-first bilingual assistant fronts the whole engine — ask it for pipeline status, launch a campaign, or review today's replies in conversation.",
    ],
    results: [
      "Runs a real outreach pipeline for a live business — capped, rate-limited, and reply-classified.",
      "45 verified prospects ingested from a single district grid-scrape in one run.",
      "TODO: add reply-rate and meetings-booked figures once a full quarter closes.",
    ],
    pullStats: [
      { value: "11", label: "Specialised agents in the engine" },
      { value: "0", label: "Sub-agency-grade emails shipped (QA-gated)" },
    ],
    terminal: {
      title: "ibrahim — outreach mission log",
      lines: [
        { kind: "cmd", text: "ibrahim run --campaign print-buyers-q3 --cap 150" },
        { kind: "sys", text: "MISSION START · prospect discovery" },
        { kind: "out", text: "maps-scraper: grid 4/9 · 45 businesses found · 38 with email" },
        { kind: "out", text: "enrich: industry=packaging · size=SME · locale=en/ar" },
        { kind: "sys", text: "creative: generating mockup → art-director QA" },
        { kind: "ok", text: "QA PASS (score 8.6/10) · attachment approved" },
        { kind: "out", text: "draft: personalised intro for Al Noor Packaging — 96 words" },
        { kind: "ok", text: "sent 38/38 · bounces auto-suppressed: 2" },
        { kind: "sys", text: "reply-classifier: 1 new reply" },
        { kind: "ok", text: 'classified HOT — "need 5,000 boxes monthly, call me"' },
        { kind: "warn", text: "escalating to human · WhatsApp alert sent" },
        { kind: "sys", text: "MISSION COMPLETE · next follow-up in 72h" },
      ],
    },
  },
  {
    slug: "adam",
    linkKey: "adam",
    codename: "M-03",
    name: "Adam",
    shortName: "Adam",
    oneLiner: "An AI estimation copilot — customers describe a print job in plain language, Adam prices it in seconds.",
    role: "Architect & engineer",
    year: "2025—",
    status: "deployed",
    stack: ["Next.js", "Vercel", "RAG", "Claude API", "WhatsApp Business API"],
    metric: "24/7",
    metricLabel: "Instant quote coverage",
    problem:
      "Every quote request that waits overnight is a customer comparing competitors. Print estimation is genuinely fiddly — sizes, stocks, finishes, quantities — so it always queued behind a busy sales team. Hours of latency on a question the business could answer in seconds.",
    system: [
      "Adam is a retrieval-augmented agent over the product knowledge base: paper stocks, finishes, machine constraints, pricing logic. A customer writes what they need in plain language — web or WhatsApp — and Adam parses specs, resolves ambiguity, and returns an accurate quote.",
      "Conversions log automatically, closing the loop between enquiry and sale. Edge cases and empty rate-cards escalate to a human instead of guessing.",
      "Deployed on Vercel as a production service in front of a real business.",
    ],
    results: [
      "Quote latency collapsed from hours to seconds on covered products.",
      "Runs in production — TODO: add quotes-per-month volume and the live demo URL (LINKS-TODO).",
    ],
    pullStats: [
      { value: "sec", label: "Quote latency, was hours" },
      { value: "100%", label: "Enquiries answered — escalation, never silence" },
    ],
    terminal: {
      title: "adam — estimation session",
      lines: [
        { kind: "sys", text: "channel: whatsapp · session 8412 open" },
        { kind: "out", text: 'customer: "need 500 business cards, both sides, matte lamination, how much?"' },
        { kind: "cmd", text: "parse → {qty: 500, product: business-card, sides: 2, finish: matte-lam}" },
        { kind: "out", text: "kb-lookup: 350gsm default stock · matte lam both sides · cut 9×5.5" },
        { kind: "ok", text: "price resolved: AED 120 · turnaround 48h" },
        { kind: "out", text: 'reply: "500 double-sided matte-laminated cards — AED 120, ready in 2 days. Shall I book it?"' },
        { kind: "ok", text: 'customer: "yes go ahead" → conversion logged' },
        { kind: "sys", text: "handoff: order → production queue · human notified" },
      ],
    },
  },
  {
    slug: "atlas",
    linkKey: "atlas",
    codename: "M-04",
    name: "Atlas",
    shortName: "Atlas",
    oneLiner: "An autonomous WooCommerce agent that watches an entire store — repricing, rewriting SEO, adjusting without a human in the loop.",
    role: "Architect & engineer",
    year: "2025—",
    status: "building",
    stack: ["Python", "WooCommerce API", "Claude API", "Cron agents"],
    metric: "SKU-scale",
    metricLabel: "Catalogue coverage, no manual passes",
    problem:
      "An e-commerce catalogue rots quietly: prices drift out of market, product SEO goes stale, and nobody notices until revenue dips. Auditing hundreds of SKUs by hand happens once — then never again.",
    system: [
      "Atlas runs the catalogue as a standing mission: scan products, compare market position, flag drift, and act — repricing within guardrails and rewriting product SEO where it underperforms.",
      "Every change is logged with a reason, so the store owner reviews decisions, not spreadsheets. Set once. Runs always.",
    ],
    results: [
      "In active development against a live WooCommerce catalogue.",
      "TODO: add SKU count and a before/after organic-traffic screenshot when the first full cycle completes.",
    ],
    pullStats: [
      { value: "∞", label: "Audit cadence — continuous, not quarterly" },
      { value: "100%", label: "Changes logged with reasoning" },
    ],
    terminal: {
      title: "atlas — pricing decision log",
      lines: [
        { kind: "cmd", text: "atlas cycle --store rainbowpress --mode guarded" },
        { kind: "sys", text: "scanning 312 SKUs · comparing market position" },
        { kind: "out", text: "SKU A4-FLYER-1K: price AED 95 · market median AED 89 · drift +6.7%" },
        { kind: "ok", text: "reprice → AED 90 (guardrail: floor AED 84, margin ≥ 22%)" },
        { kind: "out", text: "SKU MUG-11OZ: title CTR 0.4% · below category norm" },
        { kind: "ok", text: 'seo-rewrite → "Custom Printed 11oz Mug — Same-Day Dubai Delivery"' },
        { kind: "warn", text: "SKU BANNER-3X2: competitor -18% — outside guardrail, flagged for human" },
        { kind: "sys", text: "cycle complete · 14 repriced · 9 rewritten · 1 escalated" },
      ],
    },
  },
  {
    slug: "google-ads-agent",
    linkKey: "googleads",
    codename: "M-05",
    name: "Google Ads Autonomous Agent",
    shortName: "Ads Agent",
    oneLiner: "A senior media buyer that never sleeps — 9 hours of weekly optimisation down to 2, ROAS up 18% quarter over quarter.",
    role: "Architect & operator",
    year: "2024—",
    status: "production",
    stack: ["Claude Code", "Google Ads API", "GA4", "n8n + MCP"],
    metric: "+18%",
    metricLabel: "ROAS, quarter over quarter",
    problem:
      "Weekly account hygiene — bids, budgets, search terms, negatives — is what separates good accounts from bleeding ones, and it was eating 9 hours of skilled human time every week. Skip a week and waste compounds.",
    system: [
      "A production agent monitors campaigns against live GA4 signals, applies bid, keyword, and negative-keyword rules, and ships daily optimisation actions with a full audit trail.",
      "It audits, adjusts, and reports like a senior media buyer — except it runs every day, documents every decision, and never gets bored of search-term reports.",
    ],
    results: [
      "Weekly optimisation time: 9 hours → 2 (−75%).",
      "+18% ROAS quarter over quarter on AED 42K managed spend.",
      "3,750 conversions tracked on the account it manages.",
    ],
    pullStats: [
      { value: "9h→2h", label: "Weekly optimisation time" },
      { value: "+18%", label: "ROAS QoQ" },
      { value: "3,750", label: "Conversions on AED 42K" },
    ],
  },
  {
    slug: "linkedin-automation",
    linkKey: "linkedinsys",
    codename: "M-06",
    name: "LinkedIn Automation System",
    shortName: "LinkedIn Sys",
    oneLiner: "A visibility engine that researches, drafts, and schedules LinkedIn content — consistency as a system, not a habit.",
    role: "Architect & engineer",
    year: "2025—",
    status: "building",
    stack: ["Python", "Playwright", "Claude API"],
    metric: "R&D",
    metricLabel: "Prototype stage",
    problem:
      "A personal brand dies of inconsistency. Research, drafting, and scheduling each post is an hour nobody has while they're busy building the systems the posts are about.",
    system: [
      "The engine researches themes, drafts posts in Hammad's voice, and queues them for review — a human approves, the system handles cadence.",
      "Browser automation proved the fragile layer: session stability made unattended posting unreliable, so the system is being re-architected around approval-first publishing rather than headless posting.",
    ],
    results: [
      "Prototype built end-to-end; publishing layer under re-architecture — honestly labelled R&D, not production.",
      "The LinkedIn Company Page optimisation it informed (headline, tagline, specialties, posts) shipped and stayed live.",
    ],
    pullStats: [
      { value: "1h→0", label: "Per-post human time, drafting automated" },
    ],
  },
  {
    slug: "mediaforge",
    linkKey: "mediaforge",
    codename: "M-07",
    name: "MediaForge",
    shortName: "MediaForge",
    oneLiner: "A headless media generation service — one API call in, finished creative assets out.",
    role: "Architect & engineer",
    year: "2025—",
    status: "production",
    stack: ["Python", "FastAPI", "SDXL / Flux", "ffmpeg", "MCP"],
    metric: "~10s",
    metricLabel: "Per generated video clip",
    problem:
      "Creative production is the bottleneck in every campaign: images, variations, formats, motion — all queued behind a designer's calendar. Campaigns move at the speed of assets.",
    system: [
      "MediaForge is a local-first media service exposing REST and MCP interfaces: image generation (SDXL-Turbo / quantised Flux), parallax image-to-video, upscaling, and ffmpeg effects — pipeline-composable.",
      "Memory-pressure gates keep concurrent jobs inside RAM budgets, and a supervisor restarts failed stages, so the service survives being hammered.",
    ],
    results: [
      "Three phases green: REST+MCP service, image models, video pipeline (~10s per parallax clip).",
      "Consumed by other agents (including outreach mockup generation) as infrastructure.",
    ],
    pullStats: [
      { value: "1 call", label: "From prompt to finished asset" },
      { value: "~10s", label: "Image-to-video clip render" },
    ],
  },
  {
    slug: "claude-seo-squad",
    linkKey: "seosquad",
    codename: "M-08",
    name: "Claude SEO Squad",
    shortName: "SEO Squad",
    oneLiner: "Twelve agents running research, content, and optimisation across six brands — a department's output from one engineer.",
    role: "Architect & operator",
    year: "2025—",
    status: "production",
    stack: ["Claude Code", "Multi-agent orchestration", "SEO tooling", "YouTube Data API"],
    metric: "12×6",
    metricLabel: "Agents × brands covered",
    problem:
      "Six brands each need keyword research, content drafting, technical audits, and optimisation cycles. That's a department. Hammad had a weekend and a terminal.",
    system: [
      "Twelve specialised agents split the SEO discipline: researchers map keyword clusters, writers draft against briefs, auditors crawl for technical debt, and optimisers iterate on what's already ranking.",
      "The same squad pattern extended to video SEO: one autonomous run optimised 194 videos across a 780+ video catalogue in multiple languages, lifting channel SEO health to 59/100.",
    ],
    results: [
      "Runs across 6 brands' web properties on a scheduled cadence.",
      "194 videos optimised in one autonomous run (780+ catalogue).",
      "TODO: add an organic-traffic delta screenshot per brand.",
    ],
    pullStats: [
      { value: "12", label: "Specialised agents" },
      { value: "6", label: "Brands covered" },
      { value: "194", label: "Videos optimised in one run" },
    ],
  },
];

export const getProject = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);

export const nextProject = (slug: string): Project => {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(i + 1) % PROJECTS.length];
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  production: "IN PRODUCTION",
  deployed: "DEPLOYED",
  building: "IN DEVELOPMENT",
};

/** JARVIS scroll-story acts (pinned scrubbed section on /projects/jarvis). */
export const JARVIS_ACTS = [
  {
    no: "01",
    title: "SEO ENGINE",
    body: "An autonomous engine that crawls, audits, and ranks — replacing a paid toolstack with scheduled agent missions. Results logged, diffed, compounding.",
  },
  {
    no: "02",
    title: "VOICE LAYER",
    body: "The whole system answers to natural conversation. Status, summaries, mission launches — spoken. An operating system you talk to.",
  },
  {
    no: "03",
    title: "HERMES ORCHESTRATOR",
    body: "Goals in, missions out. Hermes decomposes objectives, dispatches the right agents, and holds them to the plan — while Hammad sleeps.",
  },
  {
    no: "04",
    title: "SUB-AGENT SQUAD",
    body: "Crawlers, analysts, writers, reviewers. Specialists, not generalists — each agent does one job at production grade, and the squad scales sideways.",
  },
] as const;
