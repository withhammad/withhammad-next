"use client";

import { useState } from "react";
import Reveal from "@/components/tools/Reveal";
import CopyButton from "@/components/tools/CopyButton";

interface Inputs {
  product: string;
  audience: string;
  goal: string;
  tone: string;
  extra: string;
}

const ph = (val: string, fallback: string) =>
  val.trim() ? val.trim() : `[${fallback}]`;

const extraLine = (extra: string) =>
  extra.trim() ? `\n- Extra context: ${extra.trim()}` : "";

interface Category {
  id: string;
  label: string;
  goals: string[];
  build: (i: Inputs) => string;
}

const CATEGORIES: Category[] = [
  {
    id: "google-ads",
    label: "Google Ads",
    goals: ["More conversions", "Lower CPA", "More calls", "More clicks"],
    build: (i) =>
      `Act as a senior Google Ads strategist with 10+ years scaling profitable search campaigns.

Write a complete Responsive Search Ad for:
- Product/service: ${ph(i.product, "your product/service")}
- Target audience: ${ph(i.audience, "your ideal customer")}
- Primary goal: ${ph(i.goal, "your goal")}
- Brand tone: ${ph(i.tone, "confident and clear")}${extraLine(i.extra)}

Deliver:
1. 15 headlines (max 30 characters each). Include at least 3 with the core keyword, 3 benefit-led, 2 with a number/stat, 2 with a strong CTA, and 2 that handle an objection.
2. 4 descriptions (max 90 characters each), each leading with a different angle.
3. 4 sitelink ideas (25-char title + 35-char description).
4. One line on the single strongest angle and why.

Constraints: respect every character limit, no exclamation spam, write in a ${ph(i.tone, "confident and clear")} tone, and make every line specific to ${ph(i.audience, "the audience")}. Output as clean numbered lists.`,
  },
  {
    id: "meta",
    label: "Meta Ads",
    goals: ["Purchases", "Leads", "Add to cart", "Awareness"],
    build: (i) =>
      `Act as a direct-response Meta (Facebook/Instagram) Ads creative strategist.

Brief:
- Product/service: ${ph(i.product, "your product/service")}
- Audience: ${ph(i.audience, "your ideal customer")}
- Goal: ${ph(i.goal, "your goal")}
- Tone: ${ph(i.tone, "confident and clear")}${extraLine(i.extra)}

Deliver 3 distinct ad concepts. For each:
- Scroll-stopping hook (first line)
- Primary text (~120 words: problem → agitation → solution → CTA)
- 5 headline options (max 40 characters)
- A visual/creative direction (1–2 sentences)
- The core emotional angle it tests

Then recommend which concept to test first and the one metric to watch. Write for a cold ${ph(i.audience, "audience")} unless stated otherwise.`,
  },
  {
    id: "seo",
    label: "SEO / AEO",
    goals: ["Rank #1", "Win featured snippet", "Get AI citations", "Organic leads"],
    build: (i) =>
      `Act as an SEO content strategist who writes for both Google and AI answer engines (AEO/GEO).

Topic/product: ${ph(i.product, "your topic or product")}
Audience: ${ph(i.audience, "your ideal reader")}
Goal: ${ph(i.goal, "your goal")}${extraLine(i.extra)}

Deliver:
1. A primary target keyword + 8 long-tail/semantic variations, each labelled by intent (informational/commercial).
2. A full article outline (H1, 6–9 H2s, key H3s) structured to win the featured snippet and be citable by Perplexity and ChatGPT.
3. A 40–60 word "short answer" summary to place at the very top for AEO.
4. 5 FAQ questions with 1–2 sentence answers (ready for FAQ schema).
5. 3 internal-link anchor ideas.

Optimise for clarity and citability, not keyword stuffing. Tone: ${ph(i.tone, "authoritative and clear")}.`,
  },
  {
    id: "email",
    label: "Email",
    goals: ["Nurture to sale", "Re-engage", "Onboard", "Promote offer"],
    build: (i) =>
      `Act as a lifecycle and email marketing strategist.

Offer/product: ${ph(i.product, "your offer")}
Audience/segment: ${ph(i.audience, "your subscribers")}
Goal: ${ph(i.goal, "your goal")}
Tone: ${ph(i.tone, "warm and direct")}${extraLine(i.extra)}

Deliver a 4-email sequence. For each email:
- Its purpose in the sequence
- 3 subject line options (<45 chars) + 1 preview text
- Full body copy (short, skimmable, one clear CTA)
- The CTA button text

Then add 2 A/B test ideas and the best send-time logic for ${ph(i.audience, "this segment")}. Avoid spam-trigger phrasing.`,
  },
  {
    id: "cro",
    label: "CRO",
    goals: ["Higher conversion rate", "More demos", "Lower bounce", "More signups"],
    build: (i) =>
      `Act as a conversion-rate optimisation (CRO) specialist.

Page/product: ${ph(i.product, "your landing page/product")}
Audience: ${ph(i.audience, "your ideal customer")}
Goal: ${ph(i.goal, "your goal")}${extraLine(i.extra)}

Deliver:
1. A high-converting landing page wireframe — section by section (hero, social proof, offer, objections, final CTA) — with the exact copy for each section.
2. 5 hero headline options, each a different persuasion angle (outcome, FOMO, social proof, specificity, contrarian).
3. 3 CTA button microcopy options.
4. The top 5 objections ${ph(i.audience, "this audience")} will have, each with a one-line rebuttal.
5. 3 prioritised A/B tests (hypothesis → change → metric).

Tone: ${ph(i.tone, "confident and benefit-led")}. Be specific.`,
  },
];

const FIELD =
  "h-11 w-full rounded-xl border border-white/10 bg-[var(--bg)] px-3.5 text-sm text-[var(--text)] placeholder:text-white/30 focus:border-[var(--accent-indigo)] focus:outline-none";

export default function PromptGenerator() {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id);
  const [inputs, setInputs] = useState<Inputs>({
    product: "",
    audience: "",
    goal: "",
    tone: "",
    extra: "",
  });

  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0];
  const prompt = active.build(inputs);
  const set = (key: keyof Inputs, value: string) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <Reveal className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      {/* Controls */}
      <div className="rounded-2xl border border-white/10 bg-[var(--panel)] p-5 sm:p-6">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                (c.id === activeId
                  ? "bg-[var(--accent-indigo)] text-white"
                  : "border border-white/12 text-[var(--muted)] hover:border-white/30 hover:text-[var(--text)]")
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Product / service
            </span>
            <input
              className={FIELD}
              value={inputs.product}
              onChange={(e) => set("product", e.target.value)}
              placeholder="e.g. AI bookkeeping app for freelancers"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Target audience
            </span>
            <input
              className={FIELD}
              value={inputs.audience}
              onChange={(e) => set("audience", e.target.value)}
              placeholder="e.g. solo founders doing $5k–20k/mo"
            />
          </label>

          <div className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Primary goal
            </span>
            <input
              className={FIELD}
              value={inputs.goal}
              onChange={(e) => set("goal", e.target.value)}
              placeholder="what should this achieve?"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {active.goals.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set("goal", g)}
                  className={
                    "rounded-full border px-2.5 py-1 text-xs transition-colors " +
                    (inputs.goal === g
                      ? "border-[var(--accent-amber)] bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]"
                      : "border-white/12 text-[var(--muted)] hover:border-white/30 hover:text-[var(--text)]")
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Tone <span className="normal-case text-white/30">(optional)</span>
              </span>
              <input
                className={FIELD}
                value={inputs.tone}
                onChange={(e) => set("tone", e.target.value)}
                placeholder="e.g. bold, witty, premium"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                Extra context{" "}
                <span className="normal-case text-white/30">(optional)</span>
              </span>
              <textarea
                className={FIELD + " h-20 resize-none py-2.5"}
                value={inputs.extra}
                onChange={(e) => set("extra", e.target.value)}
                placeholder="offer, price, USP, deadline, anything else…"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
            <span className="text-sm font-medium text-[var(--text)]">
              Your prompt
            </span>
            <CopyButton value={prompt} label="Copy prompt" />
          </div>
          <pre className="max-h-[60vh] overflow-auto px-5 py-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-[var(--text)]">
            {prompt}
          </pre>
        </div>
        <p className="mt-3 px-1 text-xs text-[var(--muted)]">
          Paste this into ChatGPT, Claude, or Gemini. Fields update the prompt
          live — bracketed blanks show what to fill in.
        </p>
      </div>
    </Reveal>
  );
}
