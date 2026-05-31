import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs, getPosts } from "@/lib/content";
import { stripHtml, extractFaqs } from "@/lib/blog";
import PostArtwork from "@/components/blog/PostArtwork";
import { blogCoverFor } from "@/lib/ai-images";

export const revalidate = 300;

const SITE_URL = "https://withhammad.com";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

// Contextual internal link chosen by the post's category, so each article points
// readers to the most relevant proof (case studies) or product. Matched on the
// category NAME (case-insensitive) to stay robust to slug formatting.
function contextualLink(
  categoryName: string | undefined,
): { href: string; label: string } {
  const c = (categoryName ?? "").toLowerCase();
  if (c.includes("automation") || c.includes("ai")) {
    return {
      href: "/products/automation-toolkit",
      label: "See the Automation Toolkit",
    };
  }
  if (c.includes("paid") || c.includes("ads") || c.includes("ppc")) {
    return { href: "/work", label: "See the paid-ads case studies" };
  }
  // SEO/AEO and everything else → proof in the work archive.
  return { href: "/work", label: "See the results in my case studies" };
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found | With Hammad" };

  // Per-doc SEO override (admin → post → SEO) wins over the auto-generated meta.
  const title = post.seo?.title?.trim() || `${post.title} | With Hammad`;
  const description = (
    post.seo?.description?.trim() || stripHtml(post.excerpt)
  ).slice(0, 160);
  const canonical = `/blog/${post.slug}`;
  const ogUrl = post.seo?.image || post.featuredImage?.sourceUrl;
  const images = ogUrl ? [{ url: ogUrl }] : undefined;
  const keywords = [
    ...(post.seo?.keywords?.split(",").map((k) => k.trim()) ?? []),
    ...(post.seo?.keyphrase ? [post.seo.keyphrase] : []),
    ...(post.tags ?? []),
  ].filter(Boolean);

  const section = post.categories[0]?.name;

  return {
    title,
    description,
    ...(keywords.length ? { keywords } : {}),
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: canonical,
      // Only set images when a real per-doc image exists; otherwise omit the key
      // so Next's file-based opengraph-image.tsx is auto-injected as the OG image.
      ...(images ? { images } : {}),
      publishedTime: post.date || undefined,
      modifiedTime: post.modified || post.date || undefined,
      authors: ["Hammad Yousuf"],
      ...(section ? { section } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const shortAnswer = stripHtml(post.excerpt);
  const faqs = extractFaqs(post.content);

  // Related posts: same category first, then recent.
  const all = await getPosts();
  const others = all.filter((p) => p.slug !== post.slug);
  const sameCat = others.filter((p) =>
    p.categories.some((c) =>
      post.categories.some((pc) => pc.slug === c.slug),
    ),
  );
  const related = [
    ...sameCat,
    ...others.filter((p) => !sameCat.includes(p)),
  ].slice(0, 3);

  const ctxLink = contextualLink(post.categories[0]?.name);

  const section = post.categories[0]?.name;
  const articleKeywords = [
    ...(post.seo?.keywords?.split(",").map((k) => k.trim()) ?? []),
    ...(post.tags ?? []),
  ].filter(Boolean);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: (post.seo?.description?.trim() || shortAnswer).slice(0, 200),
    image: `${SITE_URL}/blog/${post.slug}/opengraph-image`,
    datePublished: post.date || undefined,
    dateModified: post.modified || post.date || undefined,
    author: { "@type": "Person", name: "Hammad Yousuf", url: SITE_URL },
    publisher: { "@type": "Person", name: "Hammad Yousuf", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    ...(section ? { articleSection: section } : {}),
    ...(articleKeywords.length ? { keywords: articleKeywords.join(", ") } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  const faqLd =
    faqs.length >= 2
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}

      <article className="relative mx-auto max-w-3xl px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-64 opacity-50"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--accent-indigo) 20%, transparent), transparent 70%)",
          }}
        />

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        >
          <span aria-hidden>←</span> All articles
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          {post.categories[0] ? (
            <Link
              href="/blog"
              className="rounded-full border border-white/10 px-2.5 py-1 text-[var(--accent-indigo)]"
            >
              {post.categories[0].name}
            </Link>
          ) : null}
          <span>{formatDate(post.date)}</span>
          {post.authorName ? <span>· {post.authorName}</span> : null}
        </div>

        <h1
          className="mt-4 font-semibold tracking-tight text-[var(--text)]"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", lineHeight: 1.08 }}
        >
          {post.title}
        </h1>

        {/* AEO short-answer callout */}
        {shortAnswer ? (
          <div className="mt-7 rounded-2xl border border-white/10 bg-[var(--panel)] p-5">
            <div className="mb-1.5 text-xs font-medium uppercase tracking-[0.15em] text-[var(--accent-amber)]">
              Short answer
            </div>
            <p className="text-[var(--text)]">{shortAnswer}</p>
          </div>
        ) : null}

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage.sourceUrl}
              alt={post.featuredImage.altText ?? post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          ) : (
            <PostArtwork
              seed={post.slug}
              category={post.categories[0]?.name}
              imageSrc={blogCoverFor(post.categories[0]?.name)}
              variant="hero"
            />
          )}
        </div>

        <div
          className="post-content mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
            <span className="mr-1 text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
              Tags
            </span>
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/12 bg-[var(--panel)] px-3 py-1 text-xs text-[var(--text)]"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {/* Lead-magnet CTA */}
        <aside className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)] p-8 sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            style={{
              background:
                "radial-gradient(80% 120% at 0% 0%, color-mix(in oklab, var(--accent-indigo) 26%, transparent), transparent 60%), radial-gradient(80% 120% at 100% 100%, color-mix(in oklab, var(--accent-amber) 18%, transparent), transparent 60%)",
            }}
          />
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--accent-amber)] backdrop-blur">
            Free strategy session
          </span>
          <h2
            className="mt-4 max-w-xl font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.12 }}
          >
            Want this built for your business?
          </h2>
          <p className="mt-3 max-w-lg text-[var(--muted)]">
            Book a free 30-minute call and I&apos;ll map the fastest path to
            predictable, AI-driven growth — no pitch, just a plan you can run
            with.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent-indigo)] px-7 text-sm font-medium text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]"
            >
              Book a free call →
            </Link>
            <Link
              href="/tools"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-medium text-[var(--text)] transition-colors hover:border-white/35"
            >
              Explore free tools
            </Link>
          </div>
          <p className="mt-6 text-sm text-[var(--muted)]">
            Prefer proof first?{" "}
            <Link
              href={ctxLink.href}
              className="font-medium text-[var(--accent-indigo)] underline-offset-4 transition-colors hover:text-[#7C7DF3] hover:underline"
            >
              {ctxLink.label}
            </Link>
            .
          </p>
        </aside>
      </article>

      {/* Related */}
      {related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <h2 className="mb-6 text-lg font-semibold tracking-tight text-[var(--text)]">
            Keep reading
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                    {p.featuredImage ? (
                      <Image
                        src={p.featuredImage.sourceUrl}
                        alt={p.featuredImage.altText ?? p.title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <PostArtwork
                        seed={p.slug}
                        category={p.categories[0]?.name}
                        imageSrc={blogCoverFor(p.categories[0]?.name)}
                        variant="mini"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 text-xs text-[var(--muted)]">
                    {p.categories[0]?.name ?? "Article"} · {formatDate(p.date)}
                  </div>
                  <h3 className="text-base font-semibold leading-snug tracking-tight text-[var(--text)]">
                    {p.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-indigo)] transition-all duration-300 group-hover:gap-2.5">
                    Read <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
