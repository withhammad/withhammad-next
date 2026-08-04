// Server-only content fetchers backed by Payload's Local API.
// Kept OUT of lib/wp-queries.ts (which client components import for types +
// filter helpers) so Payload's node-only code never enters the client bundle.
import type { Metadata } from "next";
import { cache } from "react";
import {
  payloadClient,
  mapCaseStudy,
  mapPost,
  mapProduct,
  type PayloadCaseStudy,
  type PayloadPost,
  type PayloadProduct,
} from "@/lib/payload";
import type {
  CaseStudyCard,
  CaseStudyDetail,
  CaseStudyIndexItem,
} from "@/lib/wp-queries";
import type { PostCard, PostDetail } from "@/lib/blog";
import type { Product } from "@/lib/products";
import type { DirectoryTool, DirectoryCategory } from "@/lib/tool-directory";
import { DIRECTORY_TOOLS } from "@/lib/tool-directory";
import {
  fallbackCaseStudyBySlug,
  fallbackCaseStudyCards,
  fallbackCaseStudyIndex,
  fallbackPostBySlug,
  fallbackPostSlugs,
  fallbackPosts,
} from "@/lib/seed-fallback";

export async function getCaseStudies(): Promise<CaseStudyCard[]> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "case-studies",
      depth: 1,
      limit: 100,
    });
    const mapped = (res.docs as unknown as PayloadCaseStudy[])
      .map(mapCaseStudy)
      .sort((a, b) => {
        const ah = a.caseStudyFields?.isHero ? 1 : 0;
        const bh = b.caseStudyFields?.isHero ? 1 : 0;
        return bh - ah;
      });
    // An empty collection means the DB is reachable but unseeded — same user
    // impact as no DB at all, so fall back either way.
    return mapped.length ? mapped : fallbackCaseStudyCards();
  } catch (err) {
    console.warn(
      "[payload] case studies fetch failed — Selected Work renders empty:",
      err instanceof Error ? err.message : String(err),
    );
    return fallbackCaseStudyCards();
  }
}

export async function getCaseStudyBySlug(
  slug: string,
): Promise<CaseStudyDetail | null> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "case-studies",
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
    });
    const doc = res.docs[0] as unknown as PayloadCaseStudy | undefined;
    return doc ? mapCaseStudy(doc) : fallbackCaseStudyBySlug(slug);
  } catch (err) {
    console.warn(
      `[payload] caseStudy(${slug}) fetch failed:`,
      err instanceof Error ? err.message : String(err),
    );
    return fallbackCaseStudyBySlug(slug);
  }
}

export async function getCaseStudyIndex(): Promise<CaseStudyIndexItem[]> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "case-studies",
      depth: 0,
      limit: 100,
    });
    return (res.docs as unknown as PayloadCaseStudy[])
      .map((d) => ({
        slug: d.slug,
        title: d.title ?? null,
        isHero: Boolean(d.isHero),
        isSample: Boolean(d.isSample),
      }))
      .sort((a, b) => (b.isHero ? 1 : 0) - (a.isHero ? 1 : 0));
  } catch (err) {
    console.warn(
      "[payload] caseStudy index fetch failed:",
      err instanceof Error ? err.message : String(err),
    );
    return fallbackCaseStudyIndex();
  }
}

/* ===========================================================================
 * Blog posts (Payload-backed)
 * ======================================================================== */

export async function getPosts(): Promise<PostCard[]> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "posts",
      // Drafts are enabled on this collection for the AI pipeline, so every
      // public read must exclude them explicitly — otherwise an unreviewed
      // generated post appears on the live blog.
      where: { _status: { equals: "published" } },
      depth: 1,
      limit: 100,
      sort: "-publishedDate",
    });
    const mapped = (res.docs as unknown as PayloadPost[]).map(mapPost);
    return mapped.length ? mapped : fallbackPosts();
  } catch (err) {
    console.warn(
      "[payload] posts fetch failed — blog renders empty state:",
      err instanceof Error ? err.message : String(err),
    );
    return fallbackPosts();
  }
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "posts",
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
      },
      depth: 1,
      limit: 1,
    });
    const doc = res.docs[0] as unknown as PayloadPost | undefined;
    return doc ? mapPost(doc) : fallbackPostBySlug(slug);
  } catch (err) {
    console.warn(
      `[payload] post(${slug}) fetch failed:`,
      err instanceof Error ? err.message : String(err),
    );
    return fallbackPostBySlug(slug);
  }
}

export async function getPostSlugs(): Promise<string[]> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "posts",
      where: { _status: { equals: "published" } },
      depth: 0,
      limit: 200,
    });
    const slugs = (res.docs as unknown as PayloadPost[]).map((d) => d.slug);
    return slugs.length ? slugs : fallbackPostSlugs();
  } catch (err) {
    console.warn(
      "[payload] post slugs fetch failed:",
      err instanceof Error ? err.message : String(err),
    );
    return fallbackPostSlugs();
  }
}

/* ===========================================================================
 * Products (Payload-backed)
 * ======================================================================== */

export async function getProducts(): Promise<Product[]> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "products",
      depth: 1,
      limit: 100,
      sort: "createdAt",
    });
    return (res.docs as unknown as PayloadProduct[]).map(mapProduct);
  } catch (err) {
    console.warn(
      "[payload] products fetch failed — using fallback catalogue:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
    });
    const doc = res.docs[0] as unknown as PayloadProduct | undefined;
    return doc ? mapProduct(doc) : null;
  } catch (err) {
    console.warn(
      `[payload] product(${slug}) fetch failed:`,
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

export async function getProductSlugs(): Promise<string[]> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "products",
      depth: 0,
      limit: 200,
    });
    return (res.docs as unknown as PayloadProduct[]).map((d) => d.slug);
  } catch (err) {
    console.warn(
      "[payload] product slugs fetch failed:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

/* ===========================================================================
 * Tools directory (Payload-backed; falls back to the curated list)
 * ======================================================================== */

interface PayloadTool {
  name?: string | null;
  category?: string | null;
  useCase?: string | null;
  link?: string | null;
}

const TOOL_CATEGORIES = new Set<DirectoryCategory>([
  "writing",
  "image",
  "automation",
  "analytics",
  "seo",
]);

export async function getDirectoryTools(): Promise<DirectoryTool[]> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "tools",
      depth: 0,
      limit: 200,
      sort: "order",
    });
    const tools = (res.docs as unknown as PayloadTool[])
      .filter((t) => t.name && t.category && TOOL_CATEGORIES.has(t.category as DirectoryCategory))
      .map((t) => ({
        name: t.name as string,
        category: t.category as DirectoryCategory,
        useCase: t.useCase ?? "",
        link: t.link ?? "#",
      }));
    // If the collection is somehow empty, fall back to the curated list.
    return tools.length ? tools : DIRECTORY_TOOLS;
  } catch (err) {
    console.warn(
      "[payload] tools fetch failed — using curated directory:",
      err instanceof Error ? err.message : String(err),
    );
    return DIRECTORY_TOOLS;
  }
}

/* ===========================================================================
 * SEO — Site Settings global + per-page metadata resolver
 * ======================================================================== */

const SITE_URL = "https://withhammad.com";

type PageKey = "home" | "products" | "blog" | "tools" | "contact";

interface SiteSettings {
  defaultDescription?: string | null;
  defaultOgImage?: { url?: string | null } | null;
  twitterHandle?: string | null;
  pages?:
    | {
        key?: string | null;
        title?: string | null;
        description?: string | null;
        image?: { url?: string | null } | null;
      }[]
    | null;
}

// Cached per-render so the layout + page metadata share one DB read.
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  try {
    const payload = await payloadClient();
    const s = await payload.findGlobal({ slug: "site-settings", depth: 1 });
    return s as unknown as SiteSettings;
  } catch (err) {
    console.warn(
      "[payload] site settings fetch failed — using code defaults:",
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
});

const absUrl = (url?: string | null): string | undefined =>
  !url ? undefined : url.startsWith("http") ? url : `${SITE_URL}${url}`;

/**
 * Builds a Next Metadata object with this precedence:
 *   per-doc SEO override → per-static-page override (admin) → site defaults → code fallback.
 * Centralises SEO so every page just supplies its path + sensible fallbacks.
 */
export async function pageMetadata(opts: {
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  pageKey?: PageKey;
  doc?: {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    keywords?: string | null;
  };
  ogType?: "website" | "article";
}): Promise<Metadata> {
  const settings = await getSiteSettings();
  const pageOverride = opts.pageKey
    ? settings?.pages?.find((p) => p.key === opts.pageKey)
    : undefined;

  const title =
    opts.doc?.title?.trim() ||
    pageOverride?.title?.trim() ||
    opts.fallbackTitle;
  const description =
    opts.doc?.description?.trim() ||
    pageOverride?.description?.trim() ||
    opts.fallbackDescription?.trim() ||
    settings?.defaultDescription?.trim() ||
    "";
  const ogImage =
    absUrl(opts.doc?.image) ||
    absUrl(pageOverride?.image?.url) ||
    absUrl(settings?.defaultOgImage?.url) ||
    "https://withhammad.com/ai/og-default.jpg"; // brand fallback so every page has a social card
  const images = ogImage ? [{ url: ogImage }] : undefined;
  const creator = settings?.twitterHandle?.trim();
  const keywords = opts.doc?.keywords
    ?.split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title,
    description,
    ...(keywords && keywords.length ? { keywords } : {}),
    alternates: { canonical: opts.path },
    openGraph: {
      title,
      description,
      type: opts.ogType ?? "website",
      siteName: "With Hammad",
      locale: "en_US",
      url: opts.path,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((i) => i.url),
      ...(creator ? { creator } : {}),
    },
  };
}
