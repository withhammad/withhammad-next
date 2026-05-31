// Maps a blog category name to an on-brand AI cover in /public/ai.
// Returns undefined when nothing matches → callers fall back to the
// procedural GradientCover art (so every post still gets a cover).

export function blogCoverFor(category?: string | null): string | undefined {
  if (!category) return undefined;
  const c = category.toLowerCase();
  if (
    c.includes("automation") ||
    c.startsWith("ai") ||
    c.includes("ai &") ||
    c.includes("claude") ||
    c.includes("gpt") ||
    c.includes("a.i")
  )
    return "/ai/blog-ai-automation.jpg";
  if (
    c.includes("paid") ||
    c.includes("ads") ||
    c.includes("ppc") ||
    c.includes("google ads") ||
    c.includes("meta") ||
    c.includes("advertis")
  )
    return "/ai/blog-paid-ads.jpg";
  if (
    c.includes("seo") ||
    c.includes("aeo") ||
    c.includes("answer") ||
    c.includes("search") ||
    c.includes("geo")
  )
    return "/ai/blog-seo-aeo.jpg";
  if (
    c.includes("analytic") ||
    c.includes("data") ||
    c.includes("report") ||
    c.includes("measure")
  )
    return "/ai/blog-analytics.jpg";
  if (
    c.includes("strateg") ||
    c.includes("growth") ||
    c.includes("found") ||
    c.includes("brand")
  )
    return "/ai/blog-strategy.jpg";
  return undefined;
}
