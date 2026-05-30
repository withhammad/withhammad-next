# withhammad.com — Headless WordPress Backend Setup Guide

**Your config:** Keep current host · WordPress at `cms.withhammad.com` · WPGraphQL · ACF Free + fixed metric fields · WooCommerce already installed · you're comfortable with plugins + functions.php.

Work through this top to bottom. Steps marked **[wp-admin]** are clicks, **[code]** are paste-in snippets, **[Claude Code]** are prompts you can run on your machine, **[verify]** are checks.

---

## STEP 0 — Back up first (non-negotiable) [wp-admin]
1. Install **UpdraftPlus** (Plugins → Add New → search → Install → Activate).
2. UpdraftPlus → Settings → set remote storage to **Google Drive** → Save.
3. Click **Backup Now** (include database + files). Wait for it to finish.
4. If your host dashboard has **one-click staging**, create a staging copy now and do everything below there first, then push to live.

> Don't install the stack below until a completed backup exists.

---

## STEP 1 — Point the cms subdomain at WordPress [DNS + host]
Your WordPress will answer on `cms.withhammad.com` while Next.js (later) takes the root domain.

1. In your **DNS** (you control it): add an **A record** `cms` → your current host's server IP (same IP your site uses now). Or a **CNAME** `cms` → your host's domain target (check host docs).
2. In your **hosting panel**: add `cms.withhammad.com` as a domain/alias pointing to the same WordPress install, and issue an **SSL certificate** for it (Let's Encrypt, usually one click).
3. In **wp-admin → Settings → General**, you have two routes:
   - **Simplest:** leave WordPress Address + Site Address as the current root for now; we'll finalize the swap during the Vercel/DNS cutover (Phase 9 of the main build guide) to avoid downtime.
   - Either way, confirm `https://cms.withhammad.com/wp-admin` loads once DNS propagates.

> ⚠️ Don't change the WordPress/Site Address URLs to `cms.` until you're ready to put Next.js on the root, or your current live site will move. We sequence this at deploy time.

---

## STEP 2 — Install the plugin stack [wp-admin]
Plugins → Add New → install + activate each:

- [ ] **WPGraphQL**
- [ ] **Advanced Custom Fields** (free)
- [ ] **WPGraphQL for ACF** (the official add-on; exposes ACF fields in GraphQL)
- [ ] **WPGraphQL CORS** (lets Vercel fetch your data)
- [ ] **WPGraphQL JWT Authentication** (for draft preview later)
- [ ] **WPGraphQL for WooCommerce (WooGraphQL)** (exposes your products)
- [ ] *(WooCommerce — already installed ✅)*
- [ ] **WPCode** (safe place to add the PHP snippets below without touching theme files)

---

## STEP 3 — Register custom post types [code]
You're comfortable with functions.php, but the cleanest approach is a small snippet via **WPCode** (survives theme changes) or a child-theme `functions.php`. This registers `case_study`, `service`, and `testimonial`, all GraphQL-enabled.

**[Claude Code] prompt to generate it (optional — or just paste the code below):**
```
Write a WordPress snippet (for WPCode/functions.php) that registers three custom post types — case_study, service, testimonial — each with show_in_graphql true, public true, REST enabled, supports title/editor/thumbnail/excerpt, and sensible graphql_single_name / graphql_plural_name values. Also register a "service_type" taxonomy (PPC, SEO, Paid Social, CRO, Multi-Market) attached to case_study, GraphQL-enabled, for the front-end service filter. Give me the final code ready to paste.
```

**Ready-to-paste code:**
```php
add_action( 'init', function () {

  register_post_type( 'case_study', [
    'label'               => 'Case Studies',
    'public'              => true,
    'show_in_rest'        => true,
    'show_in_graphql'     => true,
    'graphql_single_name' => 'caseStudy',
    'graphql_plural_name' => 'caseStudies',
    'menu_icon'           => 'dashicons-chart-bar',
    'supports'            => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
    'has_archive'         => true,
    'rewrite'             => [ 'slug' => 'work' ],
  ] );

  register_post_type( 'service', [
    'label'               => 'Services',
    'public'              => true,
    'show_in_rest'        => true,
    'show_in_graphql'     => true,
    'graphql_single_name' => 'service',
    'graphql_plural_name' => 'services',
    'menu_icon'           => 'dashicons-screenoptions',
    'supports'            => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
  ] );

  register_post_type( 'testimonial', [
    'label'               => 'Testimonials',
    'public'              => true,
    'show_in_rest'        => true,
    'show_in_graphql'     => true,
    'graphql_single_name' => 'testimonial',
    'graphql_plural_name' => 'testimonials',
    'menu_icon'           => 'dashicons-format-quote',
    'supports'            => [ 'title', 'editor', 'thumbnail' ],
  ] );

  register_taxonomy( 'service_type', 'case_study', [
    'label'              => 'Service Type',
    'public'             => true,
    'hierarchical'       => true,
    'show_in_rest'       => true,
    'show_in_graphql'    => true,
    'graphql_single_name'=> 'serviceType',
    'graphql_plural_name'=> 'serviceTypes',
  ] );
} );
```
After saving, you'll see **Case Studies / Services / Testimonials** in the wp-admin sidebar. Add the service_type terms: PPC, SEO, Paid Social, CRO, Multi-Market.

---

## STEP 4 — Build the ACF fields (free + fixed metric fields) [wp-admin]
Custom Fields → Add New → create field group **"Case Study Fields"**.

**Settings:** Location rule → Post Type is equal to **Case Study**. In the group's **GraphQL** tab → set **Show in GraphQL = Yes**, GraphQL Field Name = `caseStudyFields`.

**Add these fields** (Field Name = the key the frontend reads):
- `client_name` — Text
- `industry` — Text
- `services_used` — Text
- `is_hero` — True/False
- `show_logo` — True/False
- `client_logo` — Image (Return = Image URL)
  > ⚠️ **GraphQL reality check:** even with Return Format = "Image URL", **WPGraphQL for ACF v2 exposes image fields as a media connection** (`AcfMediaItemConnectionEdge`), not a scalar string. Query it as `clientLogo { node { sourceUrl altText } }` and read `clientLogo.node.sourceUrl` on the frontend — querying `clientLogo` as a bare string throws *"must have a sub selection."* (Verified against the live endpoint; the frontend `lib/wp-queries.ts` reader is wired for the connection shape.)
- `hero_metric` — Text (the big number, e.g. "3,750")
- `hero_metric_label` — Text (e.g. "Conversions")
- `the_challenge` — Textarea
- `the_strategy` — Textarea
- `the_execution` — Textarea
- `testimonial_quote` — Textarea
- `testimonial_name` — Text
- `testimonial_title` — Text
- `testimonial_linkedin` — URL
- **Fixed results fields** (since ACF Free has no repeater):
  - `metric_1` Text / `label_1` Text
  - `metric_2` Text / `label_2` Text
  - `metric_3` Text / `label_3` Text
  - `metric_4` Text / `label_4` Text
  - `metric_5` Text / `label_5` Text
  - `gallery_note` — Textarea (paste image URLs / notes for the gallery until you upload screenshots)

> Repeat lightweight groups for **Service** (e.g. `price`, `summary`, `outcome`) and **Testimonial** (`quote`, `person_name`, `person_title`, `linkedin_url`) — each with **Show in GraphQL = Yes**.

Then create your 5 Case Study posts and paste in the content from your `case-studies-content.md` file.

---

## STEP 5 — Configure WPGraphQL [wp-admin]
1. **GraphQL → Settings:** enable **Public Introspection** (turn OFF before final launch for security; on during dev).
2. **WPGraphQL CORS settings:** add your dev + prod frontend origins to allowed origins: `http://localhost:3000` and `https://withhammad.com`. Enable "send site credentials" only if needed for preview.
3. Note your endpoint: `https://cms.withhammad.com/graphql`.

---

## STEP 6 — Expose WooCommerce products [wp-admin + verify]
WooGraphQL (installed in Step 2) auto-exposes products. Confirm your 3 products ($27 / $197 / $997) exist in WooCommerce → Products, each **Published** with a price and a working checkout. The frontend will read them via GraphQL and link the "Buy" button to the WooCommerce checkout URL on `cms.withhammad.com`.

---

## STEP 7 — Security hardening [code/wp-admin]
- Turn **off** Public Introspection before launch (Step 5).
- Disable XML-RPC and limit login attempts (a security plugin like **Wordfence** free, or your host's tools).
- Keep WooCommerce, ACF, and WPGraphQL plugins updated.
- Confirm SSL is forced on `cms.withhammad.com`.

---

## STEP 8 — Verify it all works [verify]
Open **GraphQL → GraphiQL IDE** in wp-admin and run:

**Case studies + ACF fields:**
```graphql
{
  caseStudies(first: 10) {
    nodes {
      title
      slug
      caseStudyFields {
        clientName
        industry
        isHero
        heroMetric
        heroMetricLabel
        metric1
        label1
        theChallenge
      }
      serviceTypes { nodes { name } }
    }
  }
}
```
**Products:**
```graphql
{
  products(first: 10) {
    nodes { name ... on SimpleProduct { price } }
  }
}
```
If both return your data, the backend is ready. ✅

**[Claude Code] from your machine, sanity-check the public endpoint:**
```
Run a curl POST to https://cms.withhammad.com/graphql with a GraphQL query that fetches the first 5 caseStudies (title, slug) and show me the raw JSON, so we confirm CORS and the endpoint work from outside wp-admin.
```

---

## What I need from you after this
- [ ] Confirm `https://cms.withhammad.com/graphql` is live and the two test queries return data
- [ ] Tell me your exact frontend origin(s) so CORS is correct
- [ ] Then I'll give you **Phase 2-3 frontend prompts** wired to this exact schema (the `caseStudyFields` names above), so Claude Code builds the marquee, case-study pages, products, and blog against real data.

> Heads-up on sequencing: keep WordPress answering on the root for now. We only flip the root to Next.js (and finalize `cms.` as backend-only) during the Vercel deploy step, so your live site never goes dark.
