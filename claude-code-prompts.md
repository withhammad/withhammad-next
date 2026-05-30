# withhammad.com — ALL Claude Code Prompts (in order)

Every prompt to paste into **Claude Code**, in the order you run them. Each has a **WHEN** line (the condition to run it) and **WHERE** (terminal folder). Run one, review in browser, then the next.

> Reminder: keep Claude Code on **auto-approve for file edits + local builds**, but **manual approve** for `git push`, deploys, deletions, and anything touching secrets.

---

## PROMPT 0 — (Backend, optional) Generate the WordPress CPT code
**WHEN:** during Backend Step 3, if you'd rather generate than paste the provided PHP.
**WHERE:** anywhere (it just outputs code you paste into WPCode).
```
Write a WordPress snippet (for WPCode/functions.php) that registers three custom post types — case_study, service, testimonial — each with show_in_graphql true, public true, REST enabled, supports title/editor/thumbnail/excerpt, and sensible graphql_single_name / graphql_plural_name values. Also register a "service_type" taxonomy (PPC, SEO, Paid Social, CRO, Multi-Market) attached to case_study, GraphQL-enabled, for the front-end service filter. Give me the final code ready to paste.
```

## PROMPT 0b — (Backend) Verify the GraphQL endpoint from outside
**WHEN:** after Backend Step 8, to confirm CORS + endpoint work externally.
**WHERE:** project folder or anywhere with curl.
```
Run a curl POST to https://cms.withhammad.com/graphql with a GraphQL query that fetches the first 5 caseStudies (title, slug) and show me the raw JSON, so we confirm CORS and the endpoint work from outside wp-admin.
```

---

## PROMPT 1 — Scaffold the Next.js project (Phase 2)
**WHEN:** backend is live and `cms.withhammad.com/graphql` returns data.
**WHERE:** `withhammad-next/` (empty folder), Claude Code open.
```
Create a new Next.js 14+ project using the App Router and TypeScript in the current directory. Requirements:

- Tailwind CSS configured with a custom dark-first design system using these CSS variables:
  --bg #0A0A0B, --panel #141417, --text #F5F5F7, --muted #9CA3AF,
  --accent-indigo #6366F1, --accent-amber #F59E0B.
- Install and configure the animation stack: gsap, @gsap/react, lenis, framer-motion.
- Create a SmoothScrollProvider client component that initializes Lenis and drives it from GSAP's ticker (autoRaf:false, gsap.ticker.add, lenis.on('scroll', ScrollTrigger.update), lagSmoothing(0)). Wrap the app layout in it.
- Create a lib/gsap.ts that registers ScrollTrigger once and exports gsap.
- Add a useReducedMotion hook; every animation must no-op when prefers-reduced-motion is set.
- Set up environment variables in .env.local: NEXT_PUBLIC_WP_GRAPHQL_URL=https://cms.withhammad.com/graphql, ANTHROPIC_API_KEY, LEAD_EMAIL_TO.
- Configure next.config.js to allow images from cms.withhammad.com (and withhammad.com).
- Install graphql-request and create lib/wp.ts with a typed fetcher pointed at NEXT_PUBLIC_WP_GRAPHQL_URL.
- Folder structure: app/, components/sections/, components/ui/, lib/, content/.
- Initialize git and add a sensible .gitignore.

Confirm the plan, then build it. Run the dev server so I can verify it loads at localhost:3000.
```

## PROMPT 2 — Global layout shell (Phase 3)
**WHEN:** Prompt 1 done, localhost:3000 loads.
```
Build the global layout shell for a premium dark personal-brand site:

- Sticky top nav: logo "Hammad Yousuf", links (Work, Services, Products, About, Blog), a Calendly "Book a Call" button, and a "Download CV" link. Animate the nav: hide on scroll-down, reveal on scroll-up, with a subtle blur/background fade once scrolled. Magnetic hover on the CTA button.
- Mobile: animated hamburger to a full-screen overlay menu with staggered link reveal.
- Footer: contact, social (LinkedIn, YouTube @with.hammad, portfolio), newsletter signup field, copyright.
- Page transition: use Framer Motion AnimatePresence for a smooth fade/clip transition between routes.
- A custom animated cursor (dot + trailing ring) on desktop only, disabled on touch and on reduced-motion.
- A first-load loader/intro animation (logo draw or count-in) that runs once.

Keep all text in the DOM (no hiding critical content behind animation). Use transform/opacity only. Build it, then show me in the browser.
```

## PROMPT 3 — Hero section (Phase 4a)
**WHEN:** Prompt 2 done.
```
Build the homepage HERO section, premium dark, founder-first:
- Oversized kinetic headline (use clamp() for fluid sizing) with a staggered split-text reveal on load: "AI-driven growth for founders who want results, not reports." (I'll edit copy later)
- Subhead positioning me as blended AI Marketing Growth Strategist + Performance Marketing Specialist, Dubai/UAE.
- Animated stat strip with scroll/load count-up: 3,750 conversions, 80 leads @ AED 76 CPL, -28% CPA, 540K YouTube subs. Amber accent on numbers.
- Primary CTA "Book a Call" (Calendly), secondary "See My Work".
- Subtle animated gradient-mesh background using the indigo+amber accents (CSS/canvas, lightweight, no heavy WebGL).
- My headshot integrated tastefully (I'll add the file to /public).
Use GSAP for the reveals + count-ups. Reduced-motion fallback. Build and preview.
```

## PROMPT 4 — Selected Work marquee (Phase 4b)
**WHEN:** Prompt 3 done. Pulls live case-study data.
```
Build a "Selected Work" section: an auto-scrolling seamless marquee of case-study cards pulled from WPGraphQL (caseStudies query, fields: title, slug, caseStudyFields { clientName, industry, isHero, heroMetric, heroMetricLabel, showLogo, clientLogo }, serviceTypes). Card hover = image zoom + overlay title reveal. The hero case study (isHero true) renders larger. Add a filter bar by service (serviceType: PPC, SEO, Paid Social, CRO, Multi-Market). Clicking a card routes to /work/[slug]. Reduced-motion safe. Build and preview.
```

## PROMPT 5 — Audience router (Phase 4c)
**WHEN:** Prompt 4 done.
```
Build an audience-router section with 3 animated cards: "For Founders & Owners" (primary, larger), "For Agencies & GCC Enterprises", "For Recruiters". Each scroll-revealed with stagger, each links to a tailored anchor/section. Premium dark, hover micro-interactions. Reduced-motion safe.
```

## PROMPT 6 — Services bento (Phase 4d)
**WHEN:** Prompt 5 done.
```
Build a "Services" section as an animated bento grid presenting my $999/mo productized growth service and how I work (audit, build, scale, report). Pull from WPGraphQL services if present, else static. Scroll-reveal tiles, hover states. Reduced-motion safe.
```

## PROMPT 7 — YouTube credibility block (Phase 4e)
**WHEN:** Prompt 6 done.
```
Build a credibility section featuring my YouTube channel framed as a marketer's skill: headline "I don't just run ads — I built a 540K audience from scratch," with the Silver Play Button milestone and a subscriber count-up animation. Tasteful, secondary to the hero, links to @with.hammad. Reduced-motion safe.
```

## PROMPT 8 — About + certifications (Phase 4f)
**WHEN:** Prompt 7 done.
```
Build an "About" section using my photos + bio (I'll provide text/images in /public), with a certifications row (Google, Meta, SEMrush, Dubai Future Foundation) that reveals logos on scroll. Premium dark, editorial layout. Reduced-motion safe.
```

## PROMPT 9 — Testimonials carousel (Phase 4g)
**WHEN:** Prompt 8 done.
```
Build a testimonials section as a carousel with arrow controls (like icon-ad.com), pulling from WPGraphQL testimonials (quote, person_name, person_title, linkedin_url). If there are no published testimonials, hide the entire section gracefully. Reduced-motion safe.
```

## PROMPT 10 — Final CTA + contact (Phase 4h)
**WHEN:** Prompt 9 done.
```
Build a final CTA section with a strong headline, a Calendly inline embed, and a contact block (email + socials). Scroll-reveal. Reduced-motion safe. Then assemble all homepage sections in order: Hero, Selected Work, Audience Router, Services, YouTube, About, Testimonials, Final CTA.
```

## PROMPT 11 — Case study detail pages (Phase 5)
**WHEN:** homepage assembled.
```
Build dynamic case-study pages at app/work/[slug]/page.tsx that fetch a single caseStudy from WPGraphQL by slug, including caseStudyFields (clientName, industry, servicesUsed, heroMetric, heroMetricLabel, theChallenge, theStrategy, theExecution, metric1..metric5 + label1..label5, testimonialQuote, testimonialName, testimonialTitle, testimonialLinkedin, showLogo, clientLogo). Layout as a scroll-told story:
- Full-bleed hero: client name, industry, the heroMetric in giant amber type with a count-up.
- Sticky-scroll narrative: The Challenge, The Strategy, The Execution.
- Results grid built from metric1..5 + label1..5 (skip empties), each counting up on scroll.
- Optional testimonial block (only if testimonialQuote exists).
- Show clientLogo only if showLogo is true, else an anonymized label.
- End CTA block with all three: Book a call (Calendly), View related service, Download portfolio PDF.
- Prev/next case-study nav.
Use generateStaticParams for all slugs + ISR revalidate. Reduced-motion safe. Build and preview.
```

## PROMPT 12 — AI chatbot popup (Phase 6)
**WHEN:** core pages done.
```
Build a custom AI chatbot popup:
- Floating chat bubble bottom-right; opens a sleek dark popup matching the design system. Confident, punchy, sales-y personality.
- Frontend: React client component with streaming responses and a typing indicator.
- Backend: app/api/chat/route.ts using the Anthropic API (ANTHROPIC_API_KEY), streaming.
- Load a knowledge base from content/knowledge.md and include it as system context (start with full-context injection; we can move to pgvector later).
- System prompt rules: speak as Hammad's assistant; nail these 4 — "are you available for hire", "what results have you driven", "can I book a call", "what do you charge/rates"; ALWAYS push toward booking a call (Calendly link). NEVER discuss personal/family life or personal salary expectations (service pricing is fine).
- Lead capture: on hiring intent, collect name + email + company, then POST to app/api/lead which emails LEAD_EMAIL_TO. Ask me whether to use Resend or nodemailer.
Create a starter content/knowledge.md template for me to fill. Build and preview.
```

## PROMPT 13 — Products page (Phase 7)
**WHEN:** WooCommerce products are published + WooGraphQL active.
```
Build a /products page that fetches WooCommerce products via WooGraphQL and displays them as animated pricing/product cards ($27, $197, $997). Each "Buy" button links to the WooCommerce checkout URL on cms.withhammad.com. Scroll-reveal animations, hover states. Reduced-motion safe. Build and preview.
```

## PROMPT 14 — Blog index + post pages (Phase 7b)
**WHEN:** products done; existing WP posts + new ones exist.
```
Build the blog: a /blog index that fetches posts from WPGraphQL (title, excerpt, slug, featuredImage, categories) with category-filter tabs, and dynamic /blog/[slug] pages rendering full post content. Add FAQ JSON-LD where an FAQ block exists, per-post SEO metadata (title, description, OG, canonical), and lead the layout to support a "short answer" callout at top for AEO. generateStaticParams + ISR. Scroll-reveal, reduced-motion safe. Build and preview.
```

## PROMPT 15 — ISR revalidation (Phase 8)
**WHEN:** dynamic pages built.
```
Implement on-demand ISR revalidation: create app/api/revalidate/route.ts that accepts a secret token and revalidates the relevant paths/tags (home, /work, /work/[slug], /blog, /blog/[slug], /products). Then give me the exact WordPress snippet (WPCode) to trigger this endpoint on save_post via wp_remote_post, so edits go live within seconds. Tell me the env var to add locally and on Vercel.
```

## PROMPT 16 — Performance, SEO & launch audit (Phase 10)
**WHEN:** everything built, before deploy.
```
Audit the site for Core Web Vitals and SEO: ensure all images use next/image with width/height, fonts are preloaded, below-the-fold animations are lazy-loaded, prefers-reduced-motion is respected everywhere, and add per-page metadata (title, description, Open Graph, Twitter, canonical) plus sitemap.xml and robots.txt. Add JSON-LD Person + WebSite schema. Target LCP<2.5s, INP<200ms, CLS<0.1. Show me a checklist of what you changed and any remaining risks.
```

## PROMPT 17 — Deploy via CLI (Phase 9, optional)
**WHEN:** you'd rather deploy from terminal than the Vercel dashboard. (You chose Chrome agent — use this only if you change your mind.)
```
Walk me through deploying this to Vercel via the Vercel CLI: install/login, link the project, set the env vars (NEXT_PUBLIC_WP_GRAPHQL_URL, ANTHROPIC_API_KEY, LEAD_EMAIL_TO, revalidate secret, email key), and run a production deploy. Stop and ask me before the actual deploy command.
```

---

## Quick index
| # | Prompt | Phase |
|---|---|---|
| 0 / 0b | Backend CPT code / endpoint check | 1 |
| 1 | Scaffold Next.js | 2 |
| 2 | Layout shell | 3 |
| 3-10 | Homepage sections (hero -> final CTA) | 4 |
| 11 | Case study pages | 5 |
| 12 | AI chatbot | 6 |
| 13 | Products page | 7 |
| 14 | Blog index + posts | 7b |
| 15 | ISR revalidation | 8 |
| 16 | Performance/SEO audit | 10 |
| 17 | Deploy via CLI (optional) | 9 |

> The field names in Prompts 4 & 11 (caseStudyFields, metric1..5, etc.) match exactly what you set up in the Backend Setup guide. If you rename anything in ACF, tell me and I'll update these prompts.
