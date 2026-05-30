import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getPostSlugs,
  getPosts,
  stripHtml,
  extractFaqs,
} from "@/lib/blog";

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

  const description = stripHtml(post.excerpt).slice(0, 160);
  const canonical = `/blog/${post.slug}`;
  const images = post.featuredImage
    ? [{ url: post.featuredImage.sourceUrl }]
    : undefined;

  return {
    title: `${post.title} | With Hammad`,
    description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: canonical,
      images,
      publishedTime: post.date || undefined,
      modifiedTime: post.modified || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: images?.map((i) => i.url),
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

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: shortAnswer.slice(0, 200),
    datePublished: post.date || undefined,
    dateModified: post.modified || post.date || undefined,
    author: { "@type": "Person", name: post.authorName ?? "Hammad Yousuf" },
    image: post.featuredImage?.sourceUrl,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
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

        {post.featuredImage ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={post.featuredImage.sourceUrl}
              alt={post.featuredImage.altText ?? post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <div
          className="post-content mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-[var(--panel)] p-7 text-center sm:p-9">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
            Want this done for you?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            Book a free 30-minute call and we&apos;ll map the fastest path to
            predictable growth.
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent-indigo)] px-7 text-sm font-medium text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]"
          >
            Book a Call
          </Link>
        </div>
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
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[var(--panel)] p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
              >
                <div className="mb-2 text-xs text-[var(--muted)]">
                  {p.categories[0]?.name ?? "Article"} · {formatDate(p.date)}
                </div>
                <h3 className="text-base font-semibold leading-snug tracking-tight text-[var(--text)]">
                  {p.title}
                </h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-indigo)] transition-all duration-300 group-hover:gap-2.5">
                  Read <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
