// Blog types + pure helpers — client-safe (NO Payload/node imports).
// The Payload-backed fetchers live in lib/content.ts (server-only) so this
// module can be imported by client components (e.g. BlogIndex) without pulling
// Payload's node-only code into the browser bundle.

export interface PostCategory {
  name: string;
  slug: string;
}

export interface PostImage {
  sourceUrl: string;
  altText: string | null;
}

export interface PostCard {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string; // plain text or HTML
  categories: PostCategory[];
  featuredImage: PostImage | null;
}

export interface SeoMeta {
  title: string | null;
  description: string | null;
  image: string | null;
}

export interface PostDetail extends PostCard {
  content: string; // HTML (converted from Payload's lexical richText)
  modified: string | null;
  authorName: string | null;
  seo?: SeoMeta;
}

export const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const slugifyCategory = (name: string) =>
  name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// ---- AEO helpers ----

/**
 * Heuristic FAQ extraction: finds h2/h3 headings that end in "?" and treats the
 * content up to the next heading as the answer. Used to emit FAQPage JSON-LD.
 */
export function extractFaqs(
  html: string,
): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const re = /<h[23][^>]*>([\s\S]*?)<\/h[23]>([\s\S]*?)(?=<h[23][^>]*>|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const question = stripHtml(m[1]);
    const answer = stripHtml(m[2]);
    if (question.endsWith("?") && answer.length > 20) {
      faqs.push({ question, answer: answer.slice(0, 600) });
    }
  }
  return faqs;
}
