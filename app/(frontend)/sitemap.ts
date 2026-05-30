import type { MetadataRoute } from "next";
import {
  getPostSlugs,
  getCaseStudyIndex,
  getProductSlugs,
} from "@/lib/content";

const BASE = "https://withhammad.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postSlugs, caseStudies, productSlugs] = await Promise.all([
    getPostSlugs(),
    getCaseStudyIndex(),
    getProductSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/tools",
    "/tools/prompt-generator",
    "/tools/tool-directory",
    "/tools/ad-copy-writer",
    "/tools/image-generator",
    "/products",
    "/blog",
    "/contact",
  ].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
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
