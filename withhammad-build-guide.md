# withhammad.com — Next-Gen Rebuild: Full Build Guide & Claude Code Prompts

**Stack:** Next.js (App Router) on Vercel + Headless WordPress (WPGraphQL + ACF) + WooCommerce · Animation: GSAP + ScrollTrigger + Lenis + Framer Motion · AI: custom Claude popup with RAG

---

## YOUR LOCKED SPEC

| Decision | Choice |
|---|---|
| Positioning | Blended: AI Marketing Growth Strategist + Performance Marketing Specialist |
| Primary goal | All four (job, clients, products, brand) — **founder-first** ordering |
| Tone | Premium / corporate |
| Theme | Dark-mode default |
| Motion | Maximum, engineered for speed (reduced-motion fallbacks) |
| Audiences | 1) Founders/owners 2) Agencies + GCC enterprises 3) Recruiters (students dropped from nav) |
| Case studies | Printo, Good Morning Property, Rainbow, Deewan, ICON (5) |
| Chatbot | Custom Claude popup · confident/punchy · lead → email · no salary/personal |
| Products | WooCommerce on WordPress (Gumroad dropped) |
| Integrations | Calendly + CV download |
| Access | Full WP admin + DNS control |

### Proposed palette (swap if you send YouTube hex)
- Base `#0A0A0B` · Panels `#141417` · Text `#F5F5F7` / muted `#9CA3AF`
- Accent 1 (indigo, CTAs) `#6366F1` · Accent 2 (amber, metrics) `#F59E0B`

### Content YOU still need to supply during the build (not blocking)
- [ ] ICON case study full numbers + story (current site shows −22% CPA)
- [ ] Which of the 5 case studies is the **hero**
- [ ] Which clients can show **logos** vs anonymize
- [ ] Real testimonial quotes + names + titles + LinkedIn URLs
- [ ] Pro headshot + photos (export web-optimized)

---

## PHASE 0 — Accounts & tools (30 min, manual)

1. Install **Node.js LTS** (v20+), **Git**, **VS Code**, and **Claude Code** on your machine.
2. Create free accounts: **GitHub**, **Vercel** (connect to GitHub), **Anthropic Console** (for chatbot API key).
3. Decide WP hosting: keep current host if it allows plugins + CORS, or move to **Cloudways (~$14/mo)**. You confirmed full admin, so keeping current is fine to start.
4. Create a working folder and open Claude Code there:
```
mkdir withhammad-next && cd withhammad-next && claude
```

---

## PHASE 1 — WordPress as headless backend (manual in wp-admin)

**Install these plugins** (Plugins → Add New):
- **WPGraphQL**
- **Advanced Custom Fields (ACF)** — free is fine; PRO if you want repeaters (recommended for case-study results)
- **WPGraphQL for ACF**
- **WPGraphQL CORS** (or add CORS headers via host) — lets Vercel fetch your data
- **WPGraphQL JWT Authentication** (for draft preview later)
- **Custom Post Type UI** (or register CPTs in ACF)
- **WooCommerce** (for products)

**Create Custom Post Types** (CPT UI → Add New): `case_study`, `service`, `testimonial`. (Products = WooCommerce; Blog = native Posts.)

**For `case_study`, add an ACF field group** with fields → and toggle **"Show in GraphQL" = Yes** on the group:
- `client_name` (text), `industry` (text), `services_used` (text), `is_hero` (true/false)
- `the_challenge` (textarea), `the_strategy` (textarea), `the_execution` (textarea)
- `results` (repeater: `metric` text + `label` text) — e.g. 3,750 / "Conversions"
- `testimonial_quote` (textarea), `hero_image` (image), `gallery` (gallery)
- `show_logo` (true/false), `client_logo` (image)

**Enable GraphQL introspection:** WPGraphQL → Settings → enable "Public Introspection" (dev only).

**Lock it down:** disable XML-RPC, protect `/wp-admin`, keep WooCommerce + security plugin updated.

> Checkpoint: visit `https://withhammad.com/graphql` — you should see the GraphQL endpoint respond. Note this URL; the frontend uses it.

---

## PHASE 2 — Scaffold the Next.js frontend (Claude Code)

**Paste this prompt into Claude Code:**

```
Create a new Next.js 14+ project using the App Router and TypeScript in the current directory. Requirements:

- Tailwind CSS configured with a custom dark-first design system using these CSS variables:
  --bg #0A0A0B, --panel #141417, --text #F5F5F7, --muted #9CA3AF,
  --accent-indigo #6366F1, --accent-amber #F59E0B.
- Install and configure the animation stack: gsap, @gsap/react, lenis, framer-motion.
- Create a SmoothScrollProvider client component that initializes Lenis and drives it from GSAP's ticker (autoRaf:false, gsap.ticker.add, lenis.on('scroll', ScrollTrigger.update), lagSmoothing(0)). Wrap the app layout in it.
- Create a lib/gsap.ts that registers ScrollTrigger once and exports gsap.
- Add a useReducedMotion hook; every animation must no-op when prefers-reduced-motion is set.
- Set up environment variables in .env.local: NEXT_PUBLIC_WP_GRAPHQL_URL, ANTHROPIC_API_KEY, LEAD_EMAIL_TO.
- Configure next.config.js to allow images from my WordPress media domain (ask me for it).
- Install a GraphQL client (graphql-request) and create lib/wp.ts with a typed fetcher.
- Set up a clean folder structure: app/, components/sections/, components/ui/, lib/, content/.
- Initialize git and create a sensible .gitignore.

Confirm the plan, then build it. Run the dev server so I can verify it loads.
```

When it asks for your media domain, give it (e.g. `withhammad.com`). Verify `localhost:3000` loads.

---

## PHASE 3 — Layout shell: nav, footer, page transitions (Claude Code)

```
Build the global layout shell for a premium dark personal-brand site:

- Sticky top nav: logo "Hammad Yousuf", links (Work, Services, Products, About, Blog), a Calendly "Book a Call" button, and a "Download CV" link. Animate the nav: hide on scroll-down, reveal on scroll-up, with a subtle blur/background fade once scrolled. Magnetic hover on the CTA button.
- Mobile: animated hamburger → full-screen overlay menu with staggered link reveal.
- Footer: contact, social (LinkedIn, YouTube @with.hammad, portfolio), newsletter signup field, copyright.
- Page transition: use Framer Motion AnimatePresence for a smooth fade/clip transition between routes.
- A custom animated cursor (dot + trailing ring) on desktop only, disabled on touch and on reduced-motion.
- A first-load loader/intro animation (logo draw or count-in) that runs once.

Keep all text in the DOM (no hiding critical content behind animation). Use transform/opacity only. Build it, then show me in the browser.
```

---

## PHASE 4 — Homepage sections (Claude Code, one block at a time)

Run these as separate prompts so you can review each. **Hero first:**

```
Build the homepage HERO section, premium dark, founder-first:
- Oversized kinetic headline (use clamp() for fluid sizing) with a staggered split-text reveal on load: "AI-driven growth for founders who want results, not reports." (let me edit copy later)
- Subhead positioning me as blended AI Marketing Growth Strategist + Performance Marketing Specialist, Dubai/UAE.
- Animated stat strip with scroll/load count-up: 3,750 conversions · 80 leads @ AED 76 CPL · -28% CPA · 540K YouTube subs. Amber accent on numbers.
- Primary CTA "Book a Call" (Calendly), secondary "See My Work".
- Subtle animated gradient-mesh background using the indigo+amber accents (CSS/canvas, lightweight — no heavy WebGL).
- My headshot integrated tastefully (I'll add the file to /public).
Use GSAP for the reveals + count-ups. Reduced-motion fallback. Build and preview.
```

**Then run these, each its own prompt:**
- `Build a "Selected Work" section: an auto-scrolling seamless marquee of the 5 case-study cards (Printo, Good Morning Property, Rainbow, Deewan, ICON) with image-zoom + overlay-title hover effects, pulling from WPGraphQL case_study CPT. Clicking a card routes to /work/[slug]. Mark the hero case study larger.`
- `Build an audience-router section with 3 animated cards: "For Founders & Owners" (primary, larger), "For Agencies & GCC Enterprises", "For Recruiters" — each scroll-revealed, each linking to a tailored anchor/section.`
- `Build a "Services" section presenting my $999/mo productized growth service + how I work, as an animated bento grid.`
- `Build a credibility section featuring my YouTube channel framed as a marketer's skill: "I don't just run ads — I built a 540K audience from scratch," with the Silver Play Button milestone and subscriber count-up. Keep it tasteful, not the focal hero.`
- `Build an "About" section using my photos + bio, certifications row (Google, Meta, SEMrush, Dubai Future Foundation) with logo reveal animation.`
- `Build a testimonials section (carousel with arrow controls like icon-ad.com). Leave 3 placeholder slots I'll fill with real quotes + names + LinkedIn links. If empty, hide the section.`
- `Build a final CTA section + Calendly embed + contact.`

---

## PHASE 5 — Case study detail pages (Claude Code)

```
Build dynamic case-study pages at app/work/[slug]/page.tsx that fetch a single case_study from WPGraphQL by slug. Layout as a scroll-told story:
- Full-bleed hero: client name, industry, the single biggest metric in giant amber type with a count-up.
- Sticky-scroll narrative sections: The Challenge -> The Strategy -> The Execution -> The Results.
- Results: animated metric grid from the ACF "results" repeater (metric + label), each counting up when scrolled into view.
- Optional testimonial_quote block.
- Show client_logo only if show_logo is true; otherwise display anonymized label.
- Prev/next case-study navigation at the bottom.
Use generateStaticParams for all slugs and ISR (revalidate). Reduced-motion safe. Build and preview with sample data.
```

---

## PHASE 6 — AI chatbot popup (Claude Code)

```
Build a custom AI chatbot popup for the site:
- Floating chat bubble bottom-right; opens a sleek dark popup matching the design system. Confident, punchy, sales-y personality.
- Frontend: React client component with streaming responses and a typing indicator.
- Backend: an app/api/chat/route.ts using the Anthropic API (claude via ANTHROPIC_API_KEY). Stream responses.
- RAG-lite: load a knowledge base from content/knowledge.md (I'll fill it with my bio, services, the 5 case studies + numbers, pricing, FAQ) and include it as system context. (Start with full-context injection; we can move to pgvector embeddings later if it grows.)
- System prompt rules: speak as Hammad's assistant; nail these 4 — "are you available for hire", "what results have you driven", "can I book a call", "what do you charge/rates"; ALWAYS push toward booking a call (Calendly link). NEVER discuss personal/family life or personal salary expectations (service pricing is fine).
- Lead capture: when the user shows hiring intent, ask for name + email + company, then POST to app/api/lead that emails the details to LEAD_EMAIL_TO (use Resend or nodemailer — ask me which).
Build it, create a starter content/knowledge.md template for me to fill, and preview.
```

After it builds, **fill `content/knowledge.md`** with your real info (bio, 5 case studies with numbers, $999 service, products, pricing, FAQ).

---

## PHASE 7 — Products via WooCommerce (Claude Code + manual)

**Manual:** in WordPress, set up WooCommerce, add your 3 products ($27 / $197 / $997), enable Stripe/PayPal payment, and confirm WooGraphQL or REST exposes products. (Install **WPGraphQL WooCommerce (WooGraphQL)** if using GraphQL.)

**Claude Code:**
```
Build a /products page that fetches WooCommerce products via WooGraphQL and displays them as animated pricing/product cards ($27, $197, $997). Each "Buy" button links to the WooCommerce checkout URL (hosted on WordPress). Add scroll-reveal animations. Build and preview.
```

---

## PHASE 8 — ISR + instant content updates (Claude Code + manual)

```
Implement on-demand ISR revalidation: create app/api/revalidate/route.ts that accepts a secret token and revalidates the relevant paths/tags. Then give me the exact WordPress snippet (functions.php or WPCode) to trigger this endpoint on save_post via wp_remote_post, so my edits go live within seconds.
```
Add the secret to `.env.local` and Vercel env vars. Paste the WP snippet into your site.

---

## PHASE 9 — Deploy to Vercel + point DNS (manual)

1. Push to GitHub: `git add -A && git commit -m "build" && git push`.
2. In **Vercel** -> New Project -> import the repo. Add all env vars (`NEXT_PUBLIC_WP_GRAPHQL_URL`, `ANTHROPIC_API_KEY`, `LEAD_EMAIL_TO`, revalidate secret, email key). Deploy.
3. Verify the `*.vercel.app` URL works fully (pages, work, chatbot, products).
4. **DNS cutover** (you control DNS): in Vercel add domain `withhammad.com` + `www`. Update your DNS:
   - `A` record `@` -> Vercel IP (Vercel shows it), or `ALIAS/ANAME` to `cname.vercel-dns.com`
   - `CNAME` `www` -> `cname.vercel-dns.com`
   - Keep WordPress on a subdomain like `cms.withhammad.com` (point its A record to the WP host) and update `NEXT_PUBLIC_WP_GRAPHQL_URL` to `https://cms.withhammad.com/graphql`.
5. Wait for propagation + SSL (minutes to a few hours).

> Your public site is now Next.js on Vercel; WordPress lives at `cms.withhammad.com` as the editor-only backend. This is the "deploy to WordPress" goal done the modern way — WP stays your content home.

---

## PHASE 10 — Performance, SEO & launch checklist (Claude Code + manual)

```
Audit the site for Core Web Vitals and SEO: ensure all images use next/image with width/height, fonts are preloaded, below-the-fold animations are lazy-loaded, prefers-reduced-motion is respected everywhere, and add per-page metadata (title, description, Open Graph, Twitter, canonical) plus a sitemap.xml and robots.txt. Add JSON-LD Person + WebSite schema. Show me a checklist of what you changed.
```

**Manual launch checklist:**
- [ ] Run Lighthouse (mobile) -> target LCP <2.5s, INP <200ms, CLS <0.1
- [ ] Replace placeholder testimonials with real quotes + LinkedIn URLs
- [ ] Add real ICON numbers + mark hero case study (`is_hero`)
- [ ] Fix the GTM placeholder (real container ID) + reconnect GA4/Site Kit equivalent
- [ ] Test chatbot answers on the 4 priority questions + lead email delivery
- [ ] Test WooCommerce checkout end-to-end
- [ ] Test Calendly + CV download
- [ ] Mobile pass on a real phone
- [ ] Submit sitemap to Google Search Console

---

## SUGGESTED ORDER OF WORK
Phase 0 -> 1 (get WP/GraphQL live) -> 2 -> 3 -> 4 (sections) -> 5 (case studies) -> 6 (chatbot) -> 7 (products) -> 8 (ISR) -> 9 (deploy) -> 10 (polish/launch).

Tackle one phase per session. After each Claude Code prompt, review in the browser before moving on. Send the open content items (ICON, hero pick, testimonials, colors) whenever ready to slot them in.
