import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PROJECTS,
  STATUS_LABEL,
  getProject,
  nextProject,
} from "@/lib/projects";
import { SITE_URL } from "@/lib/person";
import CaseLinks from "@/components/hud/CaseLinks";
import Terminal from "@/components/missions/Terminal";
import JarvisStory from "@/components/missions/JarvisStory";

// Unfilled proof lines are working notes — visible while developing, never
// shipped to a visitor. They are tracked in LINKS-TODO.md.
const DEV = process.env.NODE_ENV === "development";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const title = `${p.name} — ${p.oneLiner.split("—")[0].trim()} | Hammad Yousuf`;
  return {
    title,
    description: p.oneLiner,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: {
      title,
      description: p.oneLiner,
      type: "article",
      url: `/projects/${p.slug}`,
      images: ["/ai/og-default.jpg"],
    },
    twitter: { card: "summary_large_image", images: ["/ai/og-default.jpg"] },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const next = nextProject(slug);

  const creativeWorkLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.name,
    headline: p.oneLiner,
    url: `${SITE_URL}/projects/${p.slug}`,
    author: { "@type": "Person", name: "Hammad Yousuf", url: SITE_URL },
    creator: { "@type": "Person", name: "Hammad Yousuf" },
    keywords: p.stack.join(", "),
    dateCreated: p.year.replace("—", ""),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Missions", item: `${SITE_URL}/projects` },
      { "@type": "ListItem", position: 3, name: p.name },
    ],
  };

  return (
    <main className="relative" data-hud-section={`${p.codename} / ${p.name.toUpperCase()}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-28 sm:px-8 sm:pt-36">
        <Link
          href="/projects"
          data-cursor="BACK"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
        >
          ← All missions
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-mono text-[11px] tracking-[0.3em] text-[var(--accent)]/70">
            {p.codename}
          </span>
          <span
            className={`font-mono text-[9px] uppercase tracking-[0.22em] ${
              p.status === "building"
                ? "text-[var(--accent-cool)]"
                : "text-[var(--accent-2)]"
            }`}
          >
            {STATUS_LABEL[p.status]}
          </span>
        </div>

        <h1
          className="font-display mt-4 font-semibold uppercase leading-[0.9] text-[var(--text)]"
          style={{ fontSize: "clamp(2.8rem, 9vw, 8rem)" }}
        >
          {p.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
          {p.oneLiner}
        </p>

        <CaseLinks linkKey={p.linkKey} hideWriteup className="mt-8" />
      </section>

      {/* Body + sticky meta sidebar */}
      <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_260px] lg:gap-16">
          <div className="order-2 space-y-14 lg:order-1">
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]">
                The problem
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                {p.problem}
              </p>
            </div>

            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]">
                The system
              </h2>
              <div className="mt-5 space-y-5">
                {p.system.map((para, i) => (
                  <p
                    key={i}
                    className="text-base leading-relaxed text-[var(--muted)] sm:text-lg"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* pull stats */}
            <div className="grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
              {p.pullStats.map((s) => (
                <div key={s.label} className="bg-[var(--bg)] p-6">
                  <div className="text-3xl font-semibold text-[var(--accent)] sm:text-4xl">
                    {s.value}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[var(--muted)]">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]">
                Results
              </h2>
              <ul className="mt-5 space-y-3">
                {p.results
                  .filter((r) => DEV || !r.startsWith("TODO"))
                  .map((r, i) => (
                  <li
                    key={i}
                    className="relative pl-5 text-base leading-relaxed text-[var(--muted)]"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.6em] h-1.5 w-1.5 bg-[var(--accent)]"
                    />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* sticky mono meta */}
          <aside className="order-1 lg:order-2">
            <dl className="lg:sticky lg:top-28 space-y-6 border-t border-[var(--line)] pt-6 font-mono text-[11px] uppercase tracking-[0.16em]">
              <div>
                <dt className="text-[var(--muted)]/60">Role</dt>
                <dd className="mt-1.5 text-[var(--text)]">{p.role}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]/60">Year</dt>
                <dd className="mt-1.5 text-[var(--text)]">{p.year}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]/60">Status</dt>
                <dd className="mt-1.5 text-[var(--text)]">
                  {STATUS_LABEL[p.status]}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]/60">Stack</dt>
                <dd className="mt-1.5 space-y-1 text-[var(--text)]">
                  {p.stack.map((s) => (
                    <div key={s}>{s}</div>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* Terminal demo, where the project has a session log */}
      {p.terminal ? (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]">
            Live session
          </h2>
          <Terminal
            title={p.terminal.title}
            lines={p.terminal.lines}
            linkKey={p.linkKey}
            hideWriteup
          />
        </section>
      ) : null}

      {/* JARVIS gets the pinned scroll-story */}
      {p.slug === "jarvis" ? (
        <section className="border-y border-[var(--line)]">
          <JarvisStory />
        </section>
      ) : null}

      {/* Next mission */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Link
          href={`/projects/${next.slug}`}
          data-cursor="NEXT"
          className="group block border-t border-[var(--line)] pt-8"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
            Next mission — {next.codename}
          </span>
          <div className="mt-3 flex items-baseline justify-between gap-6">
            <h2
              className="font-display font-semibold uppercase leading-none text-[var(--text)] transition-colors duration-300 group-hover:text-[var(--accent)]"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.6rem)" }}
            >
              {next.name}
            </h2>
            <span className="font-mono text-sm text-[var(--accent)]">→</span>
          </div>
        </Link>
      </section>
    </main>
  );
}
