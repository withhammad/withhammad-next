# Launch checklist — withhammad.com

Everything below is either **verified**, or **needs Hammad** (credential/account
gated — nothing here is blocked on code).

## ✅ Verified (measured, not assumed)

### Core Web Vitals — local production build, median of 3 runs
| Route | LCP | LCP element | CLS |
|---|---|---|---|
| `/` first visit | 1020 ms | text | 0.002 |
| `/` repeat visit | 832 ms | `SPAN "AUTOMATION"` | 0.002 |
| `/projects` | 348 ms | `H1` | 0.002 |
| `/blog` | 332 ms | `IMG` | 0.002 |
| `/contact` | 320 ms | `H1` | 0.002 |

Budgets: LCP < 2500 ms ✅ · CLS < 0.1 ✅ · **the canvas is never the LCP
element on any route** ✅

> Measured on a fast local machine — real-world figures will be higher. Confirm
> against field data in Search Console once traffic accrues.

### 3D
- Draw calls: **6/frame** (budget < 100) ✅
- WebGL contexts: 4 created across 9 navigations, **1 alive** — no leak ✅
- `three` and the post-processing chunk load **only** on 3D routes; `/blog`,
  `/products`, `/contact`, `/projects` download neither ✅
- Adaptive quality confirmed working: a software renderer resolves to a low
  tier and post-processing correctly never loads ✅

### Accessibility
- 16 buttons, **0 without an accessible name** ✅
- 0 images without `alt` ✅ · one `<h1>` per page ✅ · `lang="en"` ✅
- Keyboard navigation reaches nav and CTAs ✅
- Contrast measured: body 17.2:1, muted 7.3:1, accent 8.0:1, button ink on
  amber 8.5:1 — all pass AA ✅
- `prefers-reduced-motion`: boot skipped, animation frozen, tier pinned to 0,
  full content readable ✅

### SEO
- Canonical present on all 10 sampled routes ✅
- JSON-LD valid on every route, **0 parse errors** ✅
  (Person, WebSite, ProfessionalService, Service, ItemList, BreadcrumbList,
  CreativeWork, Article, Blog, FAQPage, ContactPage)
- Sitemap: 38 URLs including all missions, case studies and posts ✅
- Content survives a database outage — verified by building against a
  nonexistent DB: 84 failures logged, everything still prerendered ✅

### Known budget miss — flagged, not hidden
Non-3D routes transfer **~350 KB JS** against the brief's 200 KB target.
That floor is set by the brief's own required stack: React 19 + Next runtime
(~90 KB) + framer-motion + GSAP/ScrollTrigger + Lenis. Hitting 200 KB means
dropping one of them — most realistically replacing framer-motion with CSS
animation, which costs the layout/shared-element transitions. **Recommendation:
accept ~350 KB, or decide to drop framer-motion as a deliberate trade.**

## ⚠️ Needs Hammad

### 1. Environment variables → [Vercel](https://vercel.com/hammad-s-projects9/withhammad-site/settings/environment-variables)
Values are in your local `.env.local`; never paste them into chat.

| Variable | Unlocks | Source |
|---|---|---|
| `DATABASE_URI` | **`/admin`, real CMS content** | Neon → *Portfolio* → Connect → pooled string |
| `PAYLOAD_SECRET` | Admin sessions | `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | Media uploads | Vercel → Storage → `withhammad-uploads` → Connect |
| `FISH_API_KEY` / `FISH_VOICE_ID` / `FISH_MODEL=s2.1-pro-free` | JARVIS speaking chat replies | Fish Audio |
| `GEMINI_API_KEY` | Chatbot + `npm run draft` | aistudio.google.com |
| `RESEND_API_KEY`, `LEAD_EMAIL_TO` | Contact form + purchase emails | resend.com |
| `REVALIDATE_SECRET` | ISR webhook + draft endpoint | any random string |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **Analytics (currently dark)** | GA4 Data Streams |
| `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` | LinkedIn Insight | Campaign Manager |

### 2. Neon schema migration (one-off, after `DATABASE_URI` is set)
The draft columns (`_status`, `targetKeyword`, `aiDraft`, `sourceBrief`) do not
exist in Neon yet — `push: true` is development-only. Check `/blog` and
`/admin` immediately after setting the variable; if they error, run Payload's
migration flow rather than relying on push.

### 3. Enable analytics
Vercel project → **Web Analytics** and **Speed Insights** are both currently
*Not Enabled*. Nothing is being tracked today.

### 4. Fill `LINKS-TODO.md`
Every LIVE DEMO / LINKEDIN PROOF button stays hidden until the URLs are real.
Adam's live Vercel URL is the highest-value one.

### 5. Confirm project claims
`/projects/jarvis`, `/projects/atlas`, `/projects/claude-seo-squad` carry TODO
markers where real figures and screenshots belong. TODO lines are hidden from
visitors, so the pages read fine — but they're thinner than they could be.
Also confirm **LinkedIn Automation** is fairly described as R&D.

### 6. Search Console
Verify the domain, submit `https://withhammad.com/sitemap.xml`, and watch field
CWV once traffic accrues.

### 7. Optional — Hostinger VPS
`DEPLOY.md` has the full runbook; `.github/workflows/deploy-vps.yml` is
committed but disabled (`if: false`). Needs a provisioned VPS + SSH secrets.
**Rollback is always: repoint DNS at Vercel.**
