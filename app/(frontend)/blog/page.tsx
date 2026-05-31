import type { Metadata } from "next";
import { getPosts, pageMetadata } from "@/lib/content";
import { stripHtml } from "@/lib/blog";
import BlogIndex from "@/components/blog/BlogIndex";
import Reveal from "@/components/tools/Reveal";

const SITE_URL = "https://withhammad.com";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: "/blog",
    pageKey: "blog",
    fallbackTitle: "Blog — AI Marketing, Performance & Growth | With Hammad",
    fallbackDescription:
      "Practical, no-fluff writing on AI marketing, performance media, SEO/AEO, and growth systems for founders in the GCC and beyond.",
  });
}

export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getPosts();

  // Blog + ItemList describe the archive for search/AEO; descriptive names and
  // absolute URLs per post. BreadcrumbList places the archive under Home.
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "With Hammad — Blog",
    description:
      "Practical playbooks on AI marketing, performance media, SEO/AEO, and the growth systems behind predictable revenue.",
    url: `${SITE_URL}/blog`,
    author: { "@type": "Person", name: "Hammad Yousuf", url: SITE_URL },
    publisher: { "@type": "Person", name: "Hammad Yousuf", url: SITE_URL },
    ...(posts.length
      ? {
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE_URL}/blog/${p.slug}`,
            datePublished: p.date || undefined,
            ...(p.excerpt ? { description: stripHtml(p.excerpt).slice(0, 200) } : {}),
            ...(p.categories[0] ? { articleSection: p.categories[0].name } : {}),
          })),
        }
      : {}),
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Articles",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
    ],
  };

  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <section className="relative mx-auto max-w-6xl px-5 pb-6 pt-28 sm:px-8 sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-72 opacity-60"
          style={{
            background:
              "radial-gradient(55% 100% at 50% 0%, color-mix(in oklab, var(--accent-indigo) 22%, transparent), transparent 70%)",
          }}
        />
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-amber)]" />
            Blog
          </span>
          <h1
            className="mt-5 max-w-3xl font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", lineHeight: 1.03 }}
          >
            Notes on AI-driven growth.
          </h1>
          <p className="mt-5 max-w-2xl text-[var(--muted)] sm:text-lg">
            Practical playbooks on performance marketing, SEO/AEO, and the AI
            systems behind predictable revenue.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        {posts.length > 0 ? (
          <BlogIndex posts={posts} />
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-white/12 py-20 text-center text-[var(--muted)]">
            New articles are on the way — check back soon.
          </div>
        )}
      </section>
    </main>
  );
}
