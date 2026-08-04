// Internal linking block for the end of a blog post: related missions +
// related posts. Two jobs — keep readers moving toward the conversion pages
// (/projects/*), and give the crawler a real internal link graph instead of
// isolated leaf pages.
//
// Relevance is keyword-and-tag overlap; deterministic, no client JS.

import Link from "next/link";
import { PROJECTS, STATUS_LABEL } from "@/lib/projects";
import type { PostCard } from "@/lib/blog";

/** Words too generic to signal topical relevance. */
const STOP = new Set([
  "the","a","an","and","or","for","with","your","you","how","what","why","to",
  "in","of","on","is","it","ai","marketing","use","using","guide","2026","2025",
]);

const tokens = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/[\s-]+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );

function score(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}

export default function RelatedContent({
  title,
  category,
  tags = [],
  slug,
  allPosts = [],
}: {
  title: string;
  category?: string | null;
  tags?: string[];
  slug: string;
  allPosts?: PostCard[];
}) {
  const seed = tokens([title, category ?? "", ...tags].join(" "));

  const projects = PROJECTS.map((p) => ({
    p,
    s: score(seed, tokens([p.name, p.oneLiner, p.stack.join(" ")].join(" "))),
  }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.p);

  const posts = allPosts
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      p,
      s: score(seed, tokens([p.title, p.excerpt, ...(p.tags ?? [])].join(" "))),
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.p);

  if (!projects.length && !posts.length) return null;

  return (
    <aside className="mx-auto mt-20 max-w-3xl border-t border-[var(--line)] pt-12">
      {projects.length > 0 && (
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]">
            Systems behind this
          </h2>
          <ul className="mt-5 space-y-px">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/projects/${p.slug}`}
                  data-cursor="OPEN"
                  className="group flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-4 transition-colors hover:border-[var(--accent)]/50"
                >
                  <span>
                    <span className="font-medium text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
                      {p.name}
                    </span>
                    <span className="ml-3 text-sm text-[var(--muted)]">
                      {p.oneLiner.split("—")[0].trim()}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]/70">
                    {STATUS_LABEL[p.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {posts.length > 0 && (
        <div className="mt-12">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]">
            Keep reading
          </h2>
          <ul className="mt-5 space-y-px">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  data-cursor="READ"
                  className="group block border-b border-[var(--line)] py-4 transition-colors hover:border-[var(--accent)]/50"
                >
                  <span className="font-medium text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
                    {p.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-[var(--muted)]">
                    {p.excerpt.slice(0, 130)}
                    {p.excerpt.length > 130 ? "…" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 border border-[var(--line)] p-7 text-center">
        <p className="font-display text-xl font-semibold uppercase text-[var(--text)]">
          Want systems like these in your business?
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          Book a call
        </Link>
      </div>
    </aside>
  );
}
