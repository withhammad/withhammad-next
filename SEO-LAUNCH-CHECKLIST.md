# SEO Launch Checklist — withhammad.com

Owner: Hammad Yousuf · Canonical origin: `https://withhammad.com`
Last reviewed: 2026-05-31

This is the go-live checklist for technical SEO + AEO (Answer Engine
Optimization). Work top to bottom. Items marked **[code]** are already shipped in
the repo; the rest are manual actions in third-party dashboards or Vercel.

---

## 1. Submit + verify the sitemap

- [ ] **Google Search Console** — add the property `https://withhammad.com`
      (Domain property via DNS TXT is preferred; URL-prefix works too).
- [ ] In GSC → **Sitemaps**, submit: `https://withhammad.com/sitemap.xml`
- [ ] **Bing Webmaster Tools** — add the site and submit the same sitemap URL:
      `https://withhammad.com/sitemap.xml` (you can also import the property
      straight from GSC).
- [ ] Confirm `https://withhammad.com/robots.txt` resolves and lists the sitemap
      line + `Host` (Next generates this from `app/(frontend)/robots.ts`). **[code]**

The sitemap is dynamic (`app/(frontend)/sitemap.ts`, revalidated hourly) and
covers: home, `/work` + every `/work/[slug]`, `/products` + every
`/products/[slug]`, `/blog` + every `/blog/[slug]`, `/tools` + the 4 tool
subpages (prompt-generator, tool-directory, ad-copy-writer, image-generator),
and `/contact`. Blog posts carry `lastModified` from their real published date.
`/checkout/return` is intentionally **excluded** (transactional / noindex). **[code]**

## 2. Request indexing for key pages

In GSC → **URL Inspection**, run "Request indexing" for the priority URLs:

- [ ] `https://withhammad.com/` (home)
- [ ] `https://withhammad.com/work`
- [ ] `https://withhammad.com/products`
- [ ] `https://withhammad.com/blog`
- [ ] `https://withhammad.com/tools`
- [ ] `https://withhammad.com/contact`
- [ ] Each individual `/work/[slug]` case study
- [ ] Each `/products/[slug]` landing page
- [ ] Each `/blog/[slug]` post

## 3. Validate structured data (JSON-LD)

Use the **Google Rich Results Test** (https://search.google.com/test/rich-results)
and the **Schema.org Validator** (https://validator.schema.org/) on a live URL
for each type. Confirm zero errors and review warnings.

- [ ] **Person / Organization** — home page (`Person` JSON-LD: Hammad Yousuf,
      jobTitle, `sameAs` socials).
- [ ] **Article** — a `/work/[slug]` case study (author = Person "Hammad
      Yousuf", `mainEntityOfPage`, OG image).
- [ ] **BreadcrumbList** — same case-study page (Home → Work → {client}).
- [ ] **Product** — a `/products/[slug]` page (name, description, price/offer).
      Confirm NO fabricated `aggregateRating` / `review` is emitted.
- [ ] **FAQPage** — a `/blog/[slug]` post that has Q&A headings, and any product
      page with FAQs. Confirm questions/answers render in the test.
- [ ] **Article** — a `/blog/[slug]` post.

> Integrity rule: never ship fake ratings/reviews. Testimonial Review/Rating
> schema is intentionally omitted until real, attributable reviews exist.

## 4. Search-engine verification tokens **[code-ready]**

The `verification` metadata is wired in `app/(frontend)/layout.tsx` and is
**conditional on env vars** (omitted entirely when unset, so no broken tags).
Set both in **Vercel → Project → Settings → Environment Variables**
(Production + Preview), then redeploy:

- [ ] `NEXT_PUBLIC_GSC_VERIFICATION` = the Google Search Console **HTML tag**
      verification token (the `content` value of the `google-site-verification`
      meta tag).
- [ ] `NEXT_PUBLIC_BING_VERIFICATION` = the Bing Webmaster Tools meta token
      (the `content` value of the `msvalidate.01` meta tag).
- [ ] Redeploy, then view source on the live home page and confirm both
      `<meta name="google-site-verification">` and `<meta name="msvalidate.01">`
      are present.

> They must be `NEXT_PUBLIC_*` because they're read at metadata build time.

## 5. Analytics (GA4)

There is currently **no analytics installed** (no `gtag`, no
`@next/third-parties`, no GA4 component anywhere in the app).

- [ ] Create a **GA4** property and grab the Measurement ID (`G-XXXXXXXXXX`).
- [ ] Install GA4 (recommended: `@next/third-parties/google` `<GoogleAnalytics />`
      in the layout, ID stored in `NEXT_PUBLIC_GA_ID`). *Note: layout.tsx is
      owned by the SEO stage for metadata only — coordinate the analytics
      component addition with the layout owner so changes don't collide.*
- [ ] (Optional) Link GA4 ↔ Google Search Console for query-level data.
- [ ] (Optional) Add Microsoft Clarity / Bing UET if heatmaps are wanted.

## 6. AEO — AI crawler access **[code]**

`robots.ts` explicitly **allows** the major answer-engine crawlers so With
Hammad's content can be cited in AI answers: GPTBot (OpenAI), ClaudeBot
(Anthropic), PerplexityBot, Google-Extended, Applebot-Extended, Bingbot.

- [ ] Confirm `/robots.txt` shows the per-agent `Allow: /` blocks after deploy.

## 7. Open Graph / social

- [ ] Global fallback OG image exists (`app/(frontend)/opengraph-image.tsx`) and
      per-route OG generators exist for case studies. **[code]**
- [ ] Validate cards in the **LinkedIn Post Inspector** and **X Card Validator**
      for the home page + one case study + one product + one blog post.

---

## Target keywords per page

Primary keyphrase first; secondary/supporting terms follow. Keep these reflected
in the page title, H1, meta description, and body copy (and in the per-doc /
per-page SEO fields in `/admin` where applicable).

| Page | Target keyword(s) |
| --- | --- |
| Home (`/`) | "AI marketing strategist Dubai"; "performance marketing UAE" |
| Work (`/work`) | "performance marketing case studies Dubai" |
| Blog (`/blog`) | per-post keyphrase (set each post's `meta.keyphrase` / keywords in `/admin`) |
| Products (`/products`) | product names + "marketing toolkit" |
| Tools (`/tools`) | "free marketing tools GCC" |
| Contact (`/contact`) | "book a marketing strategy call Dubai" |
| Services section (`#services`) | "performance marketing services Dubai GCC" |

---

## Core Web Vitals — status at launch

Audited the rendered components for the common CWV regressions:

- **Layout shift (CLS):** clean. Every `next/image` that uses `fill` also
  supplies a matching `sizes` prop (Hero, About, SelectedWork, CaseStudyView,
  BlogIndex, blog post, product page, ImageGenerator). No raw `<img>` tags exist
  anywhere. The `fill="none"` matches are SVG icon attributes, not next/image.
- **LCP:** the Hero headshot, product hero, and blog hero images all set
  `priority`, so the largest above-the-fold image is preloaded.
- **Fonts:** Geist / Geist Mono via `next/font/google` (self-hosted, swap, not
  render-blocking).

**Recommendation to track (not applied — lives in non-owned files):**
`ChatWidget` (mounted in the layout shell on every page) is a client component
that is **not** code-split. It's a below-the-fold floating widget, so deferring
it via `next/dynamic({ ssr: false })` (or lazy-mounting on first interaction /
idle) would cut initial JS and help INP/TBT without any visual change. This
touches `components/chat/ChatWidget.tsx` behavior, so it's left for the chat
component owner to action.
