import { wpFetch } from "@/lib/wp";

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
  excerpt: string; // HTML
  categories: PostCategory[];
  featuredImage: PostImage | null;
}

export interface PostDetail extends PostCard {
  content: string; // HTML
  modified: string | null;
  authorName: string | null;
}

type Node = {
  id: string;
  title: string | null;
  slug: string;
  date: string | null;
  modified?: string | null;
  excerpt: string | null;
  content?: string | null;
  categories: { nodes: PostCategory[] } | null;
  featuredImage: { node: { sourceUrl: string | null; altText: string | null } | null } | null;
  author?: { node: { name: string | null } | null } | null;
};

const REQUEST_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("WPGraphQL request timed out")), ms),
    ),
  ]);
}

export const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function toImage(n: Node): PostImage | null {
  const url = n.featuredImage?.node?.sourceUrl;
  return url
    ? { sourceUrl: url, altText: n.featuredImage?.node?.altText ?? null }
    : null;
}

function toCard(n: Node): PostCard {
  return {
    id: n.id,
    title: n.title ?? "Untitled",
    slug: n.slug,
    date: n.date ?? "",
    excerpt: n.excerpt ?? "",
    categories: n.categories?.nodes ?? [],
    featuredImage: toImage(n),
  };
}

// ---- Index ----

export const POSTS_QUERY = /* GraphQL */ `
  query BlogPosts {
    posts(first: 50) {
      nodes {
        id
        title
        slug
        date
        excerpt
        categories(first: 5) {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

type PostsResponse = { posts: { nodes: Node[] } | null };

export async function getPosts(): Promise<PostCard[]> {
  if (!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL) return [];
  try {
    const data = await withTimeout(
      wpFetch<PostsResponse>(POSTS_QUERY),
      REQUEST_TIMEOUT_MS,
    );
    return (data?.posts?.nodes ?? []).map(toCard);
  } catch (err) {
    console.warn(
      "[wp] posts fetch failed — blog renders empty state:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

// ---- Single post ----

export const POST_BY_SLUG_QUERY = /* GraphQL */ `
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      slug
      date
      modified
      excerpt
      content
      categories(first: 5) {
        nodes {
          name
          slug
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      author {
        node {
          name
        }
      }
    }
  }
`;

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  if (!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL) return null;
  try {
    const data = await withTimeout(
      wpFetch<{ post: Node | null }>(POST_BY_SLUG_QUERY, { slug }),
      REQUEST_TIMEOUT_MS,
    );
    const n = data?.post;
    if (!n) return null;
    return {
      ...toCard(n),
      content: n.content ?? "",
      modified: n.modified ?? null,
      authorName: n.author?.node?.name ?? null,
    };
  } catch (err) {
    console.warn(
      `[wp] post(${slug}) fetch failed:`,
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

export const POST_SLUGS_QUERY = /* GraphQL */ `
  query PostSlugs {
    posts(first: 100) {
      nodes {
        slug
      }
    }
  }
`;

export async function getPostSlugs(): Promise<string[]> {
  if (!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL) return [];
  try {
    const data = await withTimeout(
      wpFetch<{ posts: { nodes: { slug: string }[] } | null }>(POST_SLUGS_QUERY),
      REQUEST_TIMEOUT_MS,
    );
    return (data?.posts?.nodes ?? []).map((n) => n.slug);
  } catch {
    return [];
  }
}

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
