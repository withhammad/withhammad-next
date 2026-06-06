import config from "@payload-config";
import { getPayload } from "payload";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import type { CaseStudyDetail } from "@/lib/wp-queries";
import type { PostDetail } from "@/lib/blog";
import { slugifyCategory } from "@/lib/blog";
import type { Product } from "@/lib/products";

// Cached Payload instance for server-side (Local API) queries.
export const payloadClient = () => getPayload({ config });

// Lexical richText → HTML string. Returns "" for empty/invalid editor state so
// callers never crash on un-edited fields.
type LexicalArg = Parameters<typeof convertLexicalToHTML>[0]["data"];
export function lexicalToHtml(data: unknown): string {
  if (!data || typeof data !== "object" || !("root" in data)) return "";
  try {
    return convertLexicalToHTML({ data: data as LexicalArg, disableContainer: true });
  } catch {
    return "";
  }
}

// Payload `meta` group (SEO override) → the frontend SeoMeta shape, or undefined
// when the editor left every field blank.
type PayloadMeta = {
  title?: string | null;
  description?: string | null;
  keyphrase?: string | null;
  keywords?: string | null;
  image?: { url?: string | null } | null;
} | null;

export function extractSeo(meta?: PayloadMeta) {
  if (!meta) return undefined;
  const seo = {
    title: meta.title ?? null,
    description: meta.description ?? null,
    keyphrase: meta.keyphrase ?? null,
    keywords: meta.keywords ?? null,
    image: meta.image?.url ?? null,
  };
  return seo.title ||
    seo.description ||
    seo.keyphrase ||
    seo.keywords ||
    seo.image
    ? seo
    : undefined;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  ppc: "PPC",
  seo: "SEO",
  "paid-social": "Paid Social",
  cro: "CRO",
  "multi-market": "Multi-Market",
};

/* ---------------------------------------------------------------------------
 * Mappers: Payload document → the shapes the existing components expect.
 * ------------------------------------------------------------------------- */

export interface PayloadCaseStudy {
  id: string | number;
  title?: string | null;
  slug: string;
  clientName?: string | null;
  industry?: string | null;
  servicesUsed?: string | null;
  serviceTypes?: string[] | null;
  isHero?: boolean | null;
  isSample?: boolean | null;
  showLogo?: boolean | null;
  heroMetric?: string | null;
  heroMetricLabel?: string | null;
  theChallenge?: string | null;
  theStrategy?: string | null;
  theExecution?: string | null;
  videoEmbedUrl?: string | null;
  metrics?: { value?: string | null; label?: string | null }[] | null;
  testimonial?: {
    quote?: string | null;
    name?: string | null;
    title?: string | null;
    linkedin?: string | null;
  } | null;
  clientLogo?: { url?: string | null; alt?: string | null } | null;
  meta?: PayloadMeta;
}

export function mapCaseStudy(doc: PayloadCaseStudy): CaseStudyDetail {
  const metrics = doc.metrics ?? [];
  const m = (i: number) => metrics[i]?.value ?? null;
  const l = (i: number) => metrics[i]?.label ?? null;
  const t = doc.testimonial ?? {};
  return {
    id: String(doc.id),
    title: doc.title ?? null,
    slug: doc.slug,
    serviceTypes: {
      nodes: (doc.serviceTypes ?? []).map((s) => ({
        name: SERVICE_TYPE_LABELS[s] ?? s,
        slug: s,
      })),
    },
    caseStudyFields: {
      clientName: doc.clientName ?? null,
      industry: doc.industry ?? null,
      servicesUsed: doc.servicesUsed ?? null,
      isHero: doc.isHero ?? null,
      isSample: doc.isSample ?? null,
      showLogo: doc.showLogo ?? null,
      clientLogo: doc.clientLogo?.url
        ? { node: { sourceUrl: doc.clientLogo.url, altText: doc.clientLogo.alt ?? null } }
        : null,
      heroMetric: doc.heroMetric ?? null,
      heroMetricLabel: doc.heroMetricLabel ?? null,
      theChallenge: doc.theChallenge ?? null,
      theStrategy: doc.theStrategy ?? null,
      theExecution: doc.theExecution ?? null,
      videoEmbedUrl: doc.videoEmbedUrl ?? null,
      metric1: m(0),
      label1: l(0),
      metric2: m(1),
      label2: l(1),
      metric3: m(2),
      label3: l(2),
      metric4: m(3),
      label4: l(3),
      metric5: m(4),
      label5: l(4),
      testimonialQuote: t.quote ?? null,
      testimonialName: t.name ?? null,
      testimonialTitle: t.title ?? null,
      testimonialLinkedin: t.linkedin ?? null,
      galleryNote: null,
    },
    seo: extractSeo(doc.meta),
  };
}

export interface PayloadPost {
  id: string | number;
  title?: string | null;
  slug: string;
  date?: string | null;
  publishedDate?: string | null;
  updatedAt?: string | null;
  excerpt?: string | null;
  category?: string | null;
  tags?: (string | null)[] | null;
  content?: unknown; // lexical SerializedEditorState
  featuredImage?: { url?: string | null; alt?: string | null } | null;
  meta?: PayloadMeta;
}

export function mapPost(doc: PayloadPost): PostDetail {
  return {
    id: String(doc.id),
    title: doc.title ?? "Untitled",
    slug: doc.slug,
    date: doc.publishedDate ?? doc.date ?? "",
    excerpt: doc.excerpt ?? "",
    categories: doc.category
      ? [{ name: doc.category, slug: slugifyCategory(doc.category) }]
      : [],
    tags: (doc.tags ?? []).filter((t): t is string => !!t),
    featuredImage: doc.featuredImage?.url
      ? { sourceUrl: doc.featuredImage.url, altText: doc.featuredImage.alt ?? null }
      : null,
    content: lexicalToHtml(doc.content),
    modified: doc.updatedAt ?? null,
    authorName: null,
    seo: extractSeo(doc.meta),
  };
}

export interface PayloadProduct {
  id: string | number;
  name?: string | null;
  slug: string;
  priceLabel?: string | null;
  tagline?: string | null;
  features?: ({ feature?: string | null } | null)[] | null;
  buyUrl?: string | null;
  ctaLabel?: string | null;
  badge?: string | null;
  highlighted?: boolean | null;
  free?: boolean | null;
  price?: number | null;
  currency?: string | null;
  digitalFile?: unknown; // download-files doc/id when set
  fileUrl?: string | null;
  coverImage?: { url?: string | null; alt?: string | null } | null;
  description?: unknown; // lexical SerializedEditorState
  outcomes?: ({ outcome?: string | null } | null)[] | null;
  faqs?: ({ question?: string | null; answer?: string | null } | null)[] | null;
  meta?: PayloadMeta;
}

export function mapProduct(doc: PayloadProduct): Product {
  return {
    id: String(doc.id),
    name: doc.name ?? "",
    slug: doc.slug,
    priceLabel: doc.priceLabel ?? "",
    tagline: doc.tagline ?? "",
    features: (doc.features ?? [])
      .map((f) => f?.feature?.trim() ?? "")
      .filter(Boolean),
    buyUrl: doc.buyUrl ?? "",
    ctaLabel: doc.ctaLabel ?? undefined,
    badge: doc.badge ?? undefined,
    highlighted: doc.highlighted ?? undefined,
    free: doc.free ?? undefined,
    coverImageUrl: doc.coverImage?.url ?? null,
    price: doc.price ?? null,
    currency: doc.currency ?? "usd",
    purchasable: Boolean(
      (doc.price ?? 0) > 0 && (doc.digitalFile || doc.fileUrl),
    ),
    descriptionHtml: lexicalToHtml(doc.description),
    outcomes: (doc.outcomes ?? [])
      .map((o) => o?.outcome?.trim() ?? "")
      .filter(Boolean),
    faqs: (doc.faqs ?? [])
      .map((q) => ({
        question: q?.question?.trim() ?? "",
        answer: q?.answer?.trim() ?? "",
      }))
      .filter((q) => q.question && q.answer),
    seo: extractSeo(doc.meta),
  };
}
