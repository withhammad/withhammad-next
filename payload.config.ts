import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import sharp from "sharp";
import { LOCAL_CASE_STUDIES } from "./lib/case-studies-data";
import { FALLBACK_PRODUCTS } from "./lib/products";
import { DIRECTORY_TOOLS } from "./lib/tool-directory";

const TOOL_CATEGORY_OPTIONS = [
  { label: "Writing", value: "writing" },
  { label: "Image", value: "image" },
  { label: "Automation", value: "automation" },
  { label: "Analytics", value: "analytics" },
  { label: "SEO", value: "seo" },
];

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Production uses a real Postgres (Neon) via DATABASE_URI so content survives
// redeploys. Local dev falls back to a zero-setup SQLite file.
// `push: true` lets Payload create/sync its schema automatically on boot (both
// the fresh Neon Postgres in prod and the local SQLite file). This stands in for
// the migration CLI — like WordPress creating its tables on install. Schema
// changes here are additive, so push stays safe.
const db = process.env.DATABASE_URI
  ? postgresAdapter({
      push: true,
      pool: { connectionString: process.env.DATABASE_URI },
    })
  : sqliteAdapter({
      push: true,
      client: { url: process.env.SQLITE_URL ?? "file:./payload-local.db" },
    });

const SERVICE_TYPE_OPTIONS = [
  { label: "PPC", value: "ppc" },
  { label: "SEO", value: "seo" },
  { label: "Paid Social", value: "paid-social" },
  { label: "CRO", value: "cro" },
  { label: "Multi-Market", value: "multi-market" },
];

export default buildConfig({
  admin: {
    user: "users",
    meta: {
      titleSuffix: "· With Hammad",
    },
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "dev-payload-secret-change-me",
  db,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // Seed starter content on first boot (runs for local SQLite + prod Postgres).
  // Each collection is guarded independently so adding one later still seeds.
  onInit: async (payload) => {
    // ---- Case studies ----
    try {
      const existing = await payload.count({ collection: "case-studies" });
      if (existing.totalDocs === 0) {
        for (const cs of LOCAL_CASE_STUDIES) {
          const f = cs.caseStudyFields;
          if (!f) continue;
          const pairs: [string | null, string | null][] = [
            [f.metric1, f.label1],
            [f.metric2, f.label2],
            [f.metric3, f.label3],
            [f.metric4, f.label4],
            [f.metric5, f.label5],
          ];
          const metrics = pairs
            .filter(([v]) => !!v)
            .map(([value, label]) => ({
              value: value ?? "",
              label: label ?? "",
            }));
          await payload.create({
            collection: "case-studies",
            data: {
              title: cs.title ?? cs.slug,
              slug: cs.slug,
              clientName: f.clientName ?? undefined,
              industry: f.industry ?? undefined,
              servicesUsed: f.servicesUsed ?? undefined,
              serviceTypes: cs.serviceTypes?.nodes.map((n) => n.slug) ?? [],
              isHero: Boolean(f.isHero),
              isSample: Boolean(f.isSample),
              showLogo: f.showLogo ?? true,
              heroMetric: f.heroMetric ?? undefined,
              heroMetricLabel: f.heroMetricLabel ?? undefined,
              theChallenge: f.theChallenge ?? undefined,
              theStrategy: f.theStrategy ?? undefined,
              theExecution: f.theExecution ?? undefined,
              metrics,
            },
          });
        }
        payload.logger.info(
          `Seeded ${LOCAL_CASE_STUDIES.length} case studies into Payload.`,
        );
      }
    } catch (err) {
      payload.logger.error({ err }, "Case study seed failed");
    }

    // ---- Products ----
    try {
      const existing = await payload.count({ collection: "products" });
      if (existing.totalDocs === 0) {
        for (const p of FALLBACK_PRODUCTS) {
          await payload.create({
            collection: "products",
            data: {
              name: p.name,
              slug: p.slug,
              priceLabel: p.priceLabel,
              tagline: p.tagline,
              features: p.features.map((feature) => ({ feature })),
              outcomes: (p.outcomes ?? []).map((outcome) => ({ outcome })),
              buyUrl: p.buyUrl,
              badge: p.badge ?? undefined,
              highlighted: Boolean(p.highlighted),
              free: Boolean(p.free),
            },
          });
        }
        payload.logger.info(
          `Seeded ${FALLBACK_PRODUCTS.length} products into Payload.`,
        );
      }
    } catch (err) {
      payload.logger.error({ err }, "Product seed failed");
    }

    // ---- Tools directory ----
    try {
      const existing = await payload.count({ collection: "tools" });
      if (existing.totalDocs === 0) {
        let i = 0;
        for (const t of DIRECTORY_TOOLS) {
          await payload.create({
            collection: "tools",
            data: {
              name: t.name,
              category: t.category,
              useCase: t.useCase,
              link: t.link,
              order: i++,
            },
          });
        }
        payload.logger.info(
          `Seeded ${DIRECTORY_TOOLS.length} tools into Payload.`,
        );
      }
    } catch (err) {
      payload.logger.error({ err }, "Tools seed failed");
    }
  },
  collections: [
    // ---- Auth ----
    {
      slug: "users",
      auth: true,
      admin: { useAsTitle: "email", group: "Admin" },
      fields: [{ name: "name", type: "text" }],
    },

    // ---- Media (uploads) ----
    {
      slug: "media",
      admin: { group: "Admin" },
      upload: true,
      fields: [{ name: "alt", type: "text" }],
    },

    // ---- Download files (private deliverables — NOT publicly readable) ----
    {
      slug: "download-files",
      labels: { singular: "Download File", plural: "Download Files" },
      admin: {
        group: "Shop",
        description: "Private files delivered after purchase.",
      },
      // Only logged-in admins can read via the API. The token-gated download
      // route reads these via the Local API (which overrides access).
      access: { read: ({ req }) => Boolean(req.user) },
      upload: { staticDir: path.resolve(dirname, "private/downloads") },
      fields: [{ name: "label", type: "text" }],
    },

    // ---- Case Studies ----
    {
      slug: "case-studies",
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "clientName", "heroMetric", "isHero"],
        group: "Content",
      },
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
        },
        {
          type: "row",
          fields: [
            { name: "clientName", type: "text", admin: { width: "50%" } },
            { name: "industry", type: "text", admin: { width: "50%" } },
          ],
        },
        {
          name: "servicesUsed",
          type: "text",
          admin: { description: "Comma-separated, e.g. Google Ads, CRO" },
        },
        {
          name: "serviceTypes",
          type: "select",
          hasMany: true,
          options: SERVICE_TYPE_OPTIONS,
        },
        {
          type: "row",
          fields: [
            { name: "isHero", type: "checkbox", admin: { width: "33%" } },
            { name: "isSample", type: "checkbox", admin: { width: "33%" } },
            {
              name: "showLogo",
              type: "checkbox",
              defaultValue: true,
              admin: { width: "33%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "heroMetric", type: "text", admin: { width: "50%" } },
            { name: "heroMetricLabel", type: "text", admin: { width: "50%" } },
          ],
        },
        { name: "theChallenge", type: "textarea" },
        { name: "theStrategy", type: "textarea" },
        {
          name: "theExecution",
          type: "textarea",
          admin: { description: "One action per line." },
        },
        {
          name: "metrics",
          type: "array",
          maxRows: 5,
          labels: { singular: "Result", plural: "Results" },
          fields: [
            {
              type: "row",
              fields: [
                { name: "value", type: "text", admin: { width: "50%" } },
                { name: "label", type: "text", admin: { width: "50%" } },
              ],
            },
          ],
        },
        {
          name: "testimonial",
          type: "group",
          fields: [
            { name: "quote", type: "textarea" },
            { name: "name", type: "text" },
            { name: "title", type: "text" },
            { name: "linkedin", type: "text" },
          ],
        },
        { name: "clientLogo", type: "upload", relationTo: "media" },
        {
          name: "meta",
          type: "group",
          label: "SEO",
          admin: {
            description: "Optional — overrides the auto-generated SEO for this page.",
          },
          fields: [
            { name: "title", type: "text" },
            { name: "description", type: "textarea" },
            { name: "image", type: "upload", relationTo: "media" },
          ],
        },
      ],
    },

    // ---- Blog Posts ----
    {
      slug: "posts",
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "category", "publishedDate"],
        group: "Content",
      },
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
        },
        {
          name: "excerpt",
          type: "textarea",
          admin: {
            description: "Used as the card summary + the AEO 'short answer'.",
          },
        },
        { name: "category", type: "text" },
        { name: "publishedDate", type: "date" },
        { name: "featuredImage", type: "upload", relationTo: "media" },
        { name: "content", type: "richText" },
        {
          name: "meta",
          type: "group",
          label: "SEO",
          admin: {
            description: "Optional — overrides the auto-generated SEO for this page.",
          },
          fields: [
            { name: "title", type: "text" },
            { name: "description", type: "textarea" },
            { name: "image", type: "upload", relationTo: "media" },
          ],
        },
      ],
    },

    // ---- Services ----
    {
      slug: "services",
      admin: { useAsTitle: "title", group: "Content" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        { name: "excerpt", type: "textarea" },
      ],
    },

    // ---- Testimonials ----
    {
      slug: "testimonials",
      admin: { useAsTitle: "personName", group: "Content" },
      fields: [
        { name: "quote", type: "textarea", required: true },
        { name: "personName", type: "text" },
        { name: "personTitle", type: "text" },
        { name: "linkedinUrl", type: "text" },
      ],
    },

    // ---- Tools (directory of external AI/marketing tools) ----
    {
      slug: "tools",
      labels: { singular: "Tool", plural: "Tools" },
      admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "category", "featured", "order"],
        group: "Content",
      },
      defaultSort: "order",
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "category",
          type: "select",
          required: true,
          options: TOOL_CATEGORY_OPTIONS,
        },
        {
          name: "useCase",
          type: "textarea",
          admin: { description: "One line on what it's best for." },
        },
        { name: "link", type: "text", admin: { description: "https:// URL" } },
        {
          type: "row",
          fields: [
            {
              name: "order",
              type: "number",
              admin: { width: "50%", description: "Lower shows first." },
            },
            { name: "featured", type: "checkbox", admin: { width: "50%" } },
          ],
        },
      ],
    },

    // ---- Products ----
    {
      slug: "products",
      admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "priceLabel", "highlighted"],
        group: "Content",
      },
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: { description: "URL path, e.g. prompt-vault → /products/prompt-vault" },
        },
        {
          type: "row",
          fields: [
            { name: "priceLabel", type: "text", admin: { width: "50%", description: "e.g. $27 or Free" } },
            { name: "badge", type: "text", admin: { width: "50%", description: "e.g. Most popular" } },
          ],
        },
        {
          name: "tagline",
          type: "textarea",
          admin: { description: "One-line hook shown under the name." },
        },
        { name: "coverImage", type: "upload", relationTo: "media" },
        {
          name: "description",
          type: "richText",
          admin: { description: "The main landing-page body — what it is, who it's for." },
        },
        {
          name: "features",
          type: "array",
          labels: { singular: "What's included", plural: "What's included" },
          fields: [{ name: "feature", type: "text" }],
        },
        {
          name: "outcomes",
          type: "array",
          labels: { singular: "Outcome", plural: "Outcomes" },
          admin: { description: "What the buyer achieves with it." },
          fields: [{ name: "outcome", type: "text" }],
        },
        {
          name: "faqs",
          type: "array",
          labels: { singular: "FAQ", plural: "FAQs" },
          fields: [
            { name: "question", type: "text" },
            { name: "answer", type: "textarea" },
          ],
        },
        {
          name: "buyUrl",
          type: "text",
          admin: {
            description:
              "Paste your Stripe Payment Link or Gumroad URL to enable instant checkout. Leave blank to route buyers to your booking section.",
          },
        },
        {
          name: "ctaLabel",
          type: "text",
          admin: { description: "Optional button text (defaults to 'Buy · price')." },
        },
        {
          type: "row",
          fields: [
            { name: "highlighted", type: "checkbox", admin: { width: "50%" } },
            { name: "free", type: "checkbox", admin: { width: "50%" } },
          ],
        },
        {
          type: "collapsible",
          label: "Native checkout (Stripe / PayPal)",
          admin: {
            description:
              "Set a price + a deliverable to sell on-site. Leave price empty to keep using the Buy link / contact flow.",
          },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "price",
                  type: "number",
                  min: 0,
                  admin: {
                    width: "50%",
                    description: "Amount charged, e.g. 27 or 197.",
                  },
                },
                {
                  name: "currency",
                  type: "text",
                  defaultValue: "usd",
                  admin: { width: "50%", description: "ISO code: usd, aed, eur…" },
                },
              ],
            },
            {
              name: "digitalFile",
              type: "upload",
              relationTo: "download-files",
              admin: { description: "The file delivered after purchase (PDF, zip…)." },
            },
            {
              name: "fileUrl",
              type: "text",
              admin: {
                description: "Or an external download URL instead of an uploaded file.",
              },
            },
          ],
        },
        {
          name: "meta",
          type: "group",
          label: "SEO",
          admin: {
            description: "Optional — overrides the auto-generated SEO for this page.",
          },
          fields: [
            { name: "title", type: "text" },
            { name: "description", type: "textarea" },
            { name: "image", type: "upload", relationTo: "media" },
          ],
        },
      ],
    },

    // ---- Orders (created by the checkout flow; server-only writes) ----
    {
      slug: "orders",
      admin: {
        group: "Shop",
        useAsTitle: "email",
        defaultColumns: ["email", "productName", "provider", "status", "createdAt"],
      },
      // Readable only by logged-in admins. Created/updated only via the Local
      // API in the checkout routes (which override access).
      access: {
        read: ({ req }) => Boolean(req.user),
        create: () => false,
        update: () => false,
        delete: () => false,
      },
      fields: [
        { name: "product", type: "relationship", relationTo: "products" },
        { name: "productName", type: "text" },
        { name: "email", type: "email" },
        {
          type: "row",
          fields: [
            { name: "amount", type: "number" },
            { name: "currency", type: "text" },
          ],
        },
        {
          name: "provider",
          type: "select",
          options: [
            { label: "Stripe", value: "stripe" },
            { label: "PayPal", value: "paypal" },
          ],
        },
        { name: "providerRef", type: "text", index: true },
        {
          name: "status",
          type: "select",
          defaultValue: "pending",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Refunded", value: "refunded" },
          ],
        },
        { name: "downloadToken", type: "text", index: true },
        { name: "downloadExpiresAt", type: "date" },
        { name: "downloadCount", type: "number", defaultValue: 0 },
      ],
    },
  ],
  globals: [
    // ---- Site Settings (SEO + site-wide defaults) ----
    {
      slug: "site-settings",
      label: "Site Settings",
      admin: { group: "Settings" },
      fields: [
        {
          type: "collapsible",
          label: "Default SEO",
          fields: [
            {
              name: "defaultDescription",
              type: "textarea",
              admin: { description: "Fallback meta description for pages without their own." },
            },
            {
              name: "defaultOgImage",
              type: "upload",
              relationTo: "media",
              admin: { description: "Default social-share image (1200×630 recommended)." },
            },
            {
              name: "twitterHandle",
              type: "text",
              admin: { description: "e.g. @with.hammad" },
            },
          ],
        },
        {
          name: "pages",
          type: "array",
          label: "Per-page SEO overrides",
          labels: { singular: "Page", plural: "Pages" },
          admin: {
            description: "Override SEO for a specific static page by its path.",
          },
          fields: [
            {
              name: "key",
              type: "select",
              required: true,
              options: [
                { label: "Home (/)", value: "home" },
                { label: "Products (/products)", value: "products" },
                { label: "Blog (/blog)", value: "blog" },
                { label: "Tools (/tools)", value: "tools" },
                { label: "Contact (/contact)", value: "contact" },
              ],
            },
            { name: "title", type: "text" },
            { name: "description", type: "textarea" },
            { name: "image", type: "upload", relationTo: "media" },
          ],
        },
      ],
    },

    // ---- Payments (Stripe + PayPal) — manage checkout right in the admin ----
    {
      slug: "payment-settings",
      label: "Payments",
      admin: {
        group: "Settings",
        description:
          "Connect Stripe and/or PayPal to take payments on-site. Keys are stored privately and only ever used server-side. After saving, products with a price + a download file show a live checkout.",
      },
      fields: [
        {
          type: "collapsible",
          label: "Stripe",
          admin: { initCollapsed: false },
          fields: [
            {
              name: "stripeEnabled",
              type: "checkbox",
              label: "Enable Stripe checkout",
            },
            {
              name: "stripePublishableKey",
              type: "text",
              label: "Publishable key",
              admin: {
                description:
                  "Starts with pk_live_ or pk_test_ — dashboard.stripe.com/apikeys",
              },
            },
            {
              name: "stripeSecretKey",
              type: "text",
              label: "Secret key",
              admin: {
                description: "Starts with sk_live_ or sk_test_. Kept private.",
              },
            },
            {
              name: "stripeWebhookSecret",
              type: "text",
              label: "Webhook signing secret",
              admin: {
                description:
                  "whsec_… — in Stripe, add a webhook endpoint pointing to /api/webhooks/stripe and paste its signing secret here.",
              },
            },
          ],
        },
        {
          type: "collapsible",
          label: "PayPal",
          admin: { initCollapsed: false },
          fields: [
            {
              name: "paypalEnabled",
              type: "checkbox",
              label: "Enable PayPal checkout",
            },
            {
              name: "paypalClientId",
              type: "text",
              label: "Client ID",
              admin: { description: "From developer.paypal.com → your REST app" },
            },
            { name: "paypalClientSecret", type: "text", label: "Client secret" },
            {
              name: "paypalMode",
              type: "select",
              label: "Mode",
              defaultValue: "sandbox",
              options: [
                { label: "Sandbox (testing)", value: "sandbox" },
                { label: "Live", value: "live" },
              ],
            },
          ],
        },
      ],
    },
  ],
});
