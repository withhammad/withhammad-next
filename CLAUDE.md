# CLAUDE.md — Project Context for withhammad.com

> Claude Code reads this file automatically on startup. It gives you (the agent) the full picture so every prompt runs with correct context. Do not re-ask the user for things defined here.

## What we're building
A next-generation personal portfolio for **Hammad Yousuf** — a blended "AI Marketing Growth Strategist + Performance Marketing Specialist" based in Dubai/UAE. Premium, dark, heavily animated, award-worthy (benchmark: icon-ad.com). Goals: win clients, land roles, sell digital products, grow brand — **founder-first**.

## Architecture (hybrid headless)
- **Frontend:** Next.js (App Router) + TypeScript, deployed to Vercel → owns the root domain `withhammad.com`.
- **Backend:** Headless WordPress at `cms.withhammad.com` (editor-only; visitors never see it).
- **Data:** WPGraphQL. Endpoint: `https://cms.withhammad.com/graphql` (env: `NEXT_PUBLIC_WP_GRAPHQL_URL`).
- **Products:** WooCommerce + WooGraphQL; "Buy" links go to WooCommerce checkout on `cms.withhammad.com`.
- **Chatbot:** custom Anthropic Claude popup with RAG-lite from `content/knowledge.md`.

## Design system (dark-first)
CSS variables:
- `--bg: #0A0A0B` · `--panel: #141417`
- `--text: #F5F5F7` · `--muted: #9CA3AF`
- `--accent-indigo: #6366F1` (primary CTAs, links)
- `--accent-amber: #F59E0B` (metrics, highlights — use on numbers)
Typography: oversized/kinetic headlines, fluid sizing via `clamp()`. Generous whitespace. Bento grids welcome.

## Animation stack & rules
- **GSAP + ScrollTrigger** (core), **Lenis** (smooth scroll, driven by GSAP ticker), **Framer Motion** (UI/page transitions).
- Use the official `@gsap/react` `useGSAP()` hook; register ScrollTrigger once in `lib/gsap.ts`.
- **Hard rules:** animate only `transform`/`opacity`; lazy-load below-the-fold motion; respect `prefers-reduced-motion` on EVERY animation (no-op when set); keep all critical text in the DOM (never hide headlines/CTAs behind animation). Target CWV: LCP<2.5s, INP<200ms, CLS<0.1. No heavy WebGL.

## Information architecture
Nav: **Work, Services, Products, About, Blog** + "Book a Call" (Calendly) + "Download CV".
Homepage order: Hero → Selected Work (marquee) → Audience Router → Services → YouTube credibility → About → Testimonials → Final CTA.
Audiences (priority): 1) Founders & Owners 2) Agencies + GCC Enterprises 3) Recruiters. (Students intentionally dropped from nav.)

## GraphQL field names (match these exactly)
Custom post types: `caseStudy` (plural `caseStudies`), `service`, `testimonial`. Taxonomy: `serviceType` (PPC, SEO, Paid Social, CRO, Multi-Market).

`caseStudyFields` (ACF, exposed via WPGraphQL for ACF):
`clientName, industry, servicesUsed, isHero (bool), showLogo (bool), clientLogo (image), heroMetric, heroMetricLabel, theChallenge, theStrategy, theExecution, metric1..metric5, label1..label5, testimonialQuote, testimonialName, testimonialTitle, testimonialLinkedin, galleryNote`
> Note: results use FIXED fields `metric1..5` + `label1..5` (ACF Free has no repeater). Skip empties when rendering.

The 5 case studies: **Printo** (3,750 conversions), **Deewan** (−28% CPA, 4 GCC markets), **Good Morning Property** (AED 76.38 CPL), **Rainbow Printing** (+50% organic, +27% CVR), **ICON** (−22% CPA). All featured equally; homepage leads with strongest numbers.

## Products (branded "With Hammad", English)
Free lead magnet · $27 Prompt Vault · $197 Automation Toolkit · $997 Complete Growth System. Sold via WooCommerce.

## Chatbot behavior
Confident, punchy, sales-y. Must nail: "are you available for hire", "what results have you driven", "can I book a call", "what do you charge/rates". Always push toward booking a call. NEVER discuss personal/family life or personal salary expectations (service pricing is fine). Lead capture → email (`LEAD_EMAIL_TO`).

## Code conventions
- Animation/interactive components are client components (`'use client'`).
- Guard `window`/`matchMedia`. Refresh ScrollTrigger after content loads.
- Data fetching: SSG + ISR; `generateStaticParams` for dynamic routes; on-demand revalidation via `/api/revalidate`.
- Folder structure: `app/`, `components/sections/`, `components/ui/`, `lib/`, `content/`.

## Permissions / safety (important)
- Auto-approve OK for: file edits + local builds inside this project.
- ALWAYS ASK before: `git push`, deploys, deletions, commands outside the project folder, anything touching secrets.
- NEVER put real secrets/API keys/passwords in code or commits — they go in `.env.local` and Vercel env settings, entered by the user.

## Reference files in this folder
- `claude-code-prompts.md` — the 18 build prompts, in order (run sequentially).
- `withhammad-build-guide.md` — full phase-by-phase guide.
- `backend-setup-guide.md` — WordPress backend steps.
- `case-studies-content.md` — case study copy (goes into WordPress, not code).

## Build order
Backend live → Prompt 1 (scaffold) → 2 (layout) → 3-10 (sections) → 11 (case pages) → 12 (chatbot) → 13 (products) → 14 (blog) → 15 (ISR) → 16 (audit) → deploy. Run one prompt at a time; user reviews in browser between each.

## Deployment (read before shipping)

- **Git identity must be a real GitHub email.** Vercel *blocks* any deployment
  whose commit author email isn't valid for the GitHub account — the build
  never starts and the deployment sits in state `Blocked` with duration `—`.
  This machine had no `user.email` set, so commits were authored as
  `hammad@Hammads-MacBook-Pro.local` and every deploy silently failed.
  Correct value: `hammadbhat126@gmail.com` (now set globally).
- **Vercel project is `withhammad-site`**, not `withhammad-next`. The original
  project broke (deployments purged, env vars wiped) and was replaced.
- Deploy with `npx vercel@latest deploy --prod --archive=tgz --yes`. Don't fire
  a `git push` and a CLI deploy at the same time — one production build slot.
- Never commit `app/(payload)/admin/importMap.js` with the
  `VercelBlobClientUploadHandler` line missing. Running `npm run dev` without
  `BLOB_READ_WRITE_TOKEN` strips it, and committing that breaks `/admin` in
  production. Stop the dev server and `git checkout` the file before committing.

## Blog + AI draft pipeline

- `npm run draft -- --list` · `--brief=<id>` · `"free-form topic"`.
  Needs the dev server running (`npm run dev`), or `DRAFT_BASE=https://withhammad.com`.
- Generation + the Payload write both happen in `app/(frontend)/api/blog/draft/route.ts`,
  NOT in a standalone script: Payload's Local API is already wired inside Next,
  whereas `payload run` can't resolve `payload.config.ts`'s extensionless imports
  and strips argv. The npm script is a thin authenticated client.
- Auth: `Authorization: Bearer $REVALIDATE_SECRET`. Without that env var the
  endpoint returns 503 and stays closed.
- **Drafts never publish.** `_status` is hard-coded `"draft"`, the collection has
  `versions: { drafts: true }`, and all three public fetchers in `lib/content.ts`
  filter `_status = published`. Verified: draft absent from /blog, direct URL 404s,
  absent from sitemap.

### ⚠️ Production schema migration (do this once)

`versions: { drafts: true }` plus the new `targetKeyword` / `aiDraft` /
`sourceBrief` fields need columns that do not exist in the Neon database yet.
`push: true` only applies in development — `next start`/production skips it, which
is why a production insert failed with "Failed query: select count(*) from posts".

When `DATABASE_URI` is first set, verify `/blog` and `/admin` still work. If the
schema is missing, run Payload's migration flow against Neon (`payload migrate:create`
then `payload migrate`) rather than relying on push.

### Env gotcha

Use `||` not `??` for env defaults. A blank line in `.env` yields `""`, which is
present-but-empty — `??` passes it straight through. `PAYLOAD_SECRET=` (blank)
defeated its own fallback this way and crashed Payload boot.

## Content + SEO loop (Phase 8)

- `npm run calendar` regenerates `content-calendar.md` from `lib/content-briefs.ts`.
  The briefs are the source of truth (the draft pipeline reads them); the doc is
  the human view. Never hand-edit the .md.
- 12 briefs across the keyword clusters. `npm run draft -- --brief=<id>` turns any
  calendar entry into an unpublished Payload draft in one command.
- `content-calendar.md` also carries the rank-tracking table (keyword, target URL,
  position + date) and the money-page tracker.
- Internal linking: `components/blog/RelatedContent.tsx` ends every post with
  related missions + related posts + a booking CTA, scored by keyword/tag overlap.
  This is what turns blog traffic into project-page views.
- GA4 conversion events fire from `components/hud/ConversionTracking.tsx`, one
  delegated listener at the document level — so a new CTA anywhere is tracked
  without being wired up: `book_call_click`, `whatsapp_click`, `email_click`,
  `cv_download`. Plus `case_link_click` (CaseLinks) and `contact_form_submit`.
  **Mark these as key events in GA4 → Admin → Events once NEXT_PUBLIC_GA_MEASUREMENT_ID is set.**
