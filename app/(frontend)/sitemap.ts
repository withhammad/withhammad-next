import type { MetadataRoute } from "next";
import { getPosts, getCaseStudyIndex, getProductSlugs } from "@/lib/content";

const BASE = "https://withhammad.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, caseStudies, productSlugs] = await Promise.all([
    getPosts(),
    getCaseStudyIndex(),
    getProductSlugs(),
  ]);

  // Static routes: home, section indexes, the 4 tool subpages, and /contact.
  // NOTE: /checkout/return is intentionally excluded — it is a transactional,
  // noindex page (order-confirmation) that must never enter the sitemap.
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/tools",
    "/tools/prompt-generator",
    "/tools/tool-directory",
    "/tools/ad-copy-writer",
    "/tools/image-generator",
    "/tools/ai-ads-audit",
    "/work",
    "/portfolio",
    "/products",
    "/blog",
    "/contact",
  ].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  // Posts expose a real published date, so we attach lastModified. Case studies
  // and products have no real content date surfaced by their fetchers, so we
  // OMIT lastModified for those rather than fabricating one.
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    ...(post.date ? { lastModified: new Date(post.date) } : {}),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const workRoutes: MetadataRoute.Sitemap = caseStudies.map((c) => ({
    url: `${BASE}/work/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE}/products/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes, ...workRoutes, ...productRoutes];
}
