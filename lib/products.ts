import { wpFetch } from "@/lib/wp";

// Store base for WooCommerce checkout/product links (cms subdomain at cutover).
const STORE_URL =
  process.env.NEXT_PUBLIC_STORE_URL ?? "https://cms.withhammad.com";

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
}

/**
 * Curated catalogue used until WooCommerce + WooGraphQL are live. Edit freely —
 * once the store publishes matching products, getProducts() returns the live
 * WooGraphQL data instead and this becomes the fallback.
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
    buyUrl: `${STORE_URL}/product/prompt-vault/`,
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
    buyUrl: `${STORE_URL}/product/automation-toolkit/`,
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
    buyUrl: `${STORE_URL}/product/complete-growth-system/`,
  },
];

// ---- WooGraphQL (lights up once WooCommerce + WPGraphQL for WooCommerce active) ----

type WooProductNode = {
  id: string;
  name: string | null;
  slug: string | null;
  price: string | null;
  shortDescription: string | null;
  link: string | null;
};

type ProductsResponse = {
  products: { nodes: WooProductNode[] } | null;
};

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products {
    products(first: 24) {
      nodes {
        id
        name
        slug
        link
        ... on SimpleProduct {
          price
          shortDescription
        }
        ... on VariableProduct {
          price
          shortDescription
        }
      }
    }
  }
`;

const REQUEST_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("WooGraphQL request timed out")), ms),
    ),
  ]);
}

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Fetches WooCommerce products via WooGraphQL. Never throws: if WooGraphQL isn't
 * active yet (the field doesn't exist) or the request fails, returns [] so the
 * page falls back to the curated catalogue. Lights up automatically when live.
 */
export async function getProducts(): Promise<Product[]> {
  if (!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL) return [];
  try {
    const data = await withTimeout(
      wpFetch<ProductsResponse>(PRODUCTS_QUERY),
      REQUEST_TIMEOUT_MS,
    );
    const nodes = data?.products?.nodes ?? [];
    return nodes
      .filter((n) => !!n.name)
      .map((n) => ({
        id: n.id,
        name: n.name ?? "",
        slug: n.slug ?? "",
        priceLabel: n.price ?? "",
        tagline: n.shortDescription ? stripHtml(n.shortDescription) : "",
        features: [],
        buyUrl: n.link ?? `${STORE_URL}/product/${n.slug ?? ""}/`,
      }));
  } catch (err) {
    console.warn(
      "[wc] products fetch failed — using fallback catalogue:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}
