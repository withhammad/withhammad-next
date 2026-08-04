// ---------------------------------------------------------------------------
// Repo-backed fallbacks for case studies and blog posts.
//
// Why this exists: when the Payload database is unreachable — no DATABASE_URI,
// a cold Neon branch, a production build where `push: true` never creates the
// SQLite tables — the fetchers in lib/content.ts return []. That silently
// emptied /work, /blog and the sitemap in production while every page still
// returned 200, so nothing looked broken from the outside.
//
// Tools and products already had this safety net; case studies and posts did
// not. Now every content type degrades to the same repo data that seeds the
// CMS in the first place, so the site is never contentless.
// ---------------------------------------------------------------------------

import { LOCAL_CASE_STUDIES } from "@/lib/case-studies-data";
import { BLOG_SEED } from "@/lib/blog-seed";
import type { CaseStudyCard, CaseStudyDetail, CaseStudyIndexItem } from "@/lib/wp-queries";
import type { PostCard, PostDetail } from "@/lib/blog";

export const FALLBACK_CASE_STUDIES: CaseStudyDetail[] = LOCAL_CASE_STUDIES;

export const fallbackCaseStudyCards = (): CaseStudyCard[] =>
  LOCAL_CASE_STUDIES.slice().sort((a, b) => {
    const ah = a.caseStudyFields?.isHero ? 1 : 0;
    const bh = b.caseStudyFields?.isHero ? 1 : 0;
    return bh - ah;
  });

export const fallbackCaseStudyIndex = (): CaseStudyIndexItem[] =>
  LOCAL_CASE_STUDIES.map((cs) => ({
    id: cs.id,
    slug: cs.slug,
    title: cs.title,
    isHero: Boolean(cs.caseStudyFields?.isHero),
    isSample: Boolean(cs.caseStudyFields?.isSample),
  }));

export const fallbackCaseStudyBySlug = (slug: string): CaseStudyDetail | null =>
  LOCAL_CASE_STUDIES.find((cs) => cs.slug === slug) ?? null;

/**
 * Minimal markdown → HTML for the fallback path only. The real content route
 * is Payload's Lexical → HTML converter; this just has to render the seed
 * posts legibly if the database is unavailable. Deliberately small: headings,
 * bold/italic, links, lists, paragraphs.
 */
function markdownToHtml(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inline = (s: string) =>
    escape(s)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };

  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      closeList();
      const lvl = h[1].length;
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
      continue;
    }
    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) {
      if (list !== "ul") {
        closeList();
        out.push("<ul>");
        list = "ul";
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      if (list !== "ol") {
        closeList();
        out.push("<ol>");
        list = "ol";
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      closeList();
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}

const toCard = (p: (typeof BLOG_SEED)[number], i: number): PostCard => ({
  id: `seed-${p.slug}`,
  title: p.title,
  slug: p.slug,
  date: p.publishedDate,
  excerpt: p.excerpt,
  categories: p.category ? [{ name: p.category, slug: p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") }] : [],
  featuredImage: null,
  tags: [],
});

export const fallbackPosts = (): PostCard[] =>
  BLOG_SEED.slice()
    .sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1))
    .map(toCard);

export const fallbackPostSlugs = (): string[] => BLOG_SEED.map((p) => p.slug);

export const fallbackPostBySlug = (slug: string): PostDetail | null => {
  const idx = BLOG_SEED.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  const p = BLOG_SEED[idx];
  return {
    ...toCard(p, idx),
    content: markdownToHtml(p.markdown),
    modified: null,
    authorName: "Hammad Yousuf",
    seo: {
      title: p.metaTitle ?? null,
      description: p.metaDescription ?? null,
      keyphrase: null,
      keywords: null,
      image: null,
    },
  };
};
