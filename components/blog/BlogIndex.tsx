"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/tools/Reveal";
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

function CardImage({ post }: { post: PostCard }) {
  if (post.featuredImage) {
    return (
      <Image
        src={post.featuredImage.sourceUrl}
        alt={post.featuredImage.altText ?? post.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <div
      aria-hidden
      className="h-full w-full"
      style={{
        background:
          "radial-gradient(120% 120% at 0% 0%, color-mix(in oklab, var(--accent-indigo) 35%, transparent), transparent 55%), radial-gradient(120% 120% at 100% 100%, color-mix(in oklab, var(--accent-amber) 22%, transparent), transparent 55%), var(--bg)",
      }}
    >
      <span className="flex h-full w-full items-center justify-center text-5xl font-semibold text-white/10">
        {post.categories[0]?.name ?? "With Hammad"}
      </span>
    </div>
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

  return (
    <>
      {categories.length > 0 ? (
        <Reveal>
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setActive(t.slug)}
                className={
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
                  (active === t.slug
                    ? "bg-[var(--accent-indigo)] text-white"
                    : "border border-white/12 text-[var(--muted)] hover:border-white/30 hover:text-[var(--text)]")
                }
              >
                {t.name}
              </button>
            ))}
          </div>
        </Reveal>
      ) : null}

      <Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <CardImage post={post} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                  {post.categories[0] ? (
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[var(--accent-indigo)]">
                      {post.categories[0].name}
                    </span>
                  ) : null}
                  <span>{formatDate(post.date)}</span>
                </div>
                <h3 className="text-base font-semibold leading-snug tracking-tight text-[var(--text)]">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                  {stripHtml(post.excerpt)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-indigo)] transition-all duration-300 group-hover:gap-2.5">
                  Read article <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </>
  );
}
