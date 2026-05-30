// Product types + pure helpers — client-safe (NO Payload/node imports).
// The Payload-backed fetchers live in lib/content.ts (server-only).

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceLabel: string;
  tagline: string;
  features: string[];
  buyUrl: string;
  badge?: string;
  highlighted?: boolean;
  free?: boolean;
  // Rich fields used by the per-product landing page (all optional).
  ctaLabel?: string;
  coverImageUrl?: string | null;
  descriptionHtml?: string;
  outcomes?: string[];
  faqs?: ProductFaq[];
  seo?: { title: string | null; description: string | null; image: string | null };
  // Native checkout
  price?: number | null; // numeric amount; enables Stripe/PayPal when > 0
  currency?: string; // ISO code, e.g. usd
  purchasable?: boolean; // price > 0 AND a deliverable is attached
}

/**
 * Curated catalogue. Doubles as the seed for the Payload `products` collection
 * (first boot) and the runtime fallback if the collection is ever empty. Once
 * the admin holds products, getProducts() (lib/content.ts) returns those.
 */
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "lead-magnet",
    name: "The Growth Audit Checklist",
    slug: "growth-audit-checklist",
    priceLabel: "Free",
    tagline: "The 25-point checklist I use to find revenue leaks fast.",
    features: [
      "25-point funnel & ad-account audit",
      "Spot wasted spend in 15 minutes",
      "Prioritised fix list to action today",
    ],
    outcomes: [
      "A clear view of where budget is leaking",
      "Three quick wins you can ship this week",
    ],
    buyUrl: "/#contact",
    free: true,
  },
  {
    id: "prompt-vault",
    name: "Prompt Vault",
    slug: "prompt-vault",
    priceLabel: "$27",
    tagline: "100+ battle-tested marketing prompts, ready to paste.",
    features: [
      "100+ plug-and-play prompts",
      "Ads, SEO, email, CRO & more",
      "Built for ChatGPT, Claude & Gemini",
      "Lifetime updates",
    ],
    outcomes: [
      "Cut content & campaign drafting time by hours each week",
      "A repeatable prompt library your whole team can use",
    ],
    buyUrl: "",
  },
  {
    id: "automation-toolkit",
    name: "Automation Toolkit",
    slug: "automation-toolkit",
    priceLabel: "$197",
    tagline: "Done-for-you automation workflows and templates.",
    features: [
      "20+ ready automation workflows",
      "n8n / Make / Zapier blueprints",
      "Lead-nurture & reporting templates",
      "Setup walkthrough videos",
      "Everything in Prompt Vault",
    ],
    outcomes: [
      "Automate lead-nurture, reporting & follow-ups",
      "Win back hours of manual ops every week",
    ],
    buyUrl: "",
    badge: "Most popular",
    highlighted: true,
  },
  {
    id: "growth-system",
    name: "Complete Growth System",
    slug: "complete-growth-system",
    priceLabel: "$997",
    tagline: "The full system — audits, playbooks, automations, and support.",
    features: [
      "The complete playbook library",
      "All toolkits & the Prompt Vault included",
      "Account-audit templates",
      "Private community access",
      "Priority email support",
    ],
    outcomes: [
      "A complete, documented growth engine",
      "Direct support so you never get stuck",
    ],
    buyUrl: "",
  },
];

// ---- Buy / CTA helpers (pure; shared by ProductGrid + landing pages) ----

/** True when buyUrl is a real external checkout link (Stripe Payment Link, Gumroad, …). */
export function isExternalBuy(p: Product): boolean {
  return /^https?:\/\//i.test(p.buyUrl ?? "");
}

/** Where the buy button points: external link → native checkout (detail page) → booking. */
export function buyHref(p: Product): string {
  if (isExternalBuy(p)) return p.buyUrl;
  if (p.purchasable) return `/products/${p.slug}`; // detail page hosts the checkout
  if (p.free && p.buyUrl) return p.buyUrl;
  return "/#contact";
}

/** Button label. Honest when no checkout is set up yet. */
export function buyLabel(p: Product): string {
  if (p.ctaLabel?.trim()) return p.ctaLabel.trim();
  if (p.free) return "Get it free";
  if (isExternalBuy(p) || p.purchasable) return `Buy · ${p.priceLabel}`;
  return "Enquire to buy";
}
