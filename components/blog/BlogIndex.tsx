"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import PostArtwork from "@/components/blog/PostArtwork";
import { blogCoverFor } from "@/lib/ai-images";
import type { PostCard } from "@/lib/blog";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function Cover({
  post,
  variant = "card",
}: {
  post: PostCard;
  variant?: "card" | "hero" | "mini";
}) {
  if (post.featuredImage) {
    return (
      <Image
        src={post.featuredImage.sourceUrl}
        alt={post.featuredImage.altText ?? post.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
      />
    );
  }
  return (
    <PostArtwork
      seed={post.slug}
      category={post.categories[0]?.name}
      imageSrc={blogCoverFor(post.categories[0]?.name)}
      eyebrow={variant === "hero" ? post.categories[0]?.name : null}
      variant={variant}
    />
  );
}

function CategoryChip({ post }: { post: PostCard }) {
  const cat = post.categories[0];
  if (!cat) return null;
  return (
    <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[var(--accent)] backdrop-blur">
      {cat.name}
    </span>
  );
}

export default function BlogIndex({ posts }: { posts: PostCard[] }) {
  const [active, setActive] = useState("all");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((p) =>
      p.categories.forEach((c) => map.set(c.slug, c.name)),
    );
    return Array.from(map, ([slug, name]) => ({ slug, name }));
  }, [posts]);

  const filtered = useMemo(
    () =>
      active === "all"
        ? posts
        : posts.filter((p) => p.categories.some((c) => c.slug === active)),
    [posts, active],
  );

  const tabs = [{ slug: "all", name: "All" }, ...categories];
  const [featured, ...rest] = filtered;

  return (
    <>
      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActive(t.slug)}
              className={
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                (active === t.slug
                  ? "bg-[var(--accent)] text-white"
                  : "border border-white/12 text-[var(--muted)] hover:border-white/30 hover:text-[var(--text)]")
              }
            >
              {t.name}
            </button>
          ))}
        </div>
      ) : null}

      {/* Featured post */}
      {featured ? (
        <motion.div
          key={`feat-${featured.id}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-8"
        >
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25 lg:grid-cols-[1.15fr_1fr]"
          >
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[340px]">
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <Cover post={featured} variant="hero" />
              </div>
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-medium tracking-wide text-[var(--text)] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
                Featured
              </span>
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-9">
              <div className="mb-4 flex items-center gap-2 text-xs text-[var(--muted)]">
                <CategoryChip post={featured} />
                <span>{formatDate(featured.date)}</span>
              </div>
              <h2
                className="font-semibold tracking-tight text-[var(--text)]"
                style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.3rem)", lineHeight: 1.1 }}
              >
                {featured.title}
              </h2>
              <p className="mt-4 line-clamp-3 text-[var(--muted)] sm:text-lg">
                {stripHtml(featured.excerpt)}
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] transition-all duration-300 group-hover:gap-3">
                Read article <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        </motion.div>
      ) : null}

      {/* Grid of remaining posts */}
      {rest.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                    <Cover post={post} variant="card" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                    <CategoryChip post={post} />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <h3 className="text-base font-semibold leading-snug tracking-tight text-[var(--text)]">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                    {stripHtml(post.excerpt)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] transition-all duration-300 group-hover:gap-2.5">
                    Read article <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : null}
    </>
  );
}
