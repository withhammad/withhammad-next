import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/tools/Reveal";
import { GCC_TOOLS, AI_TOOLS, type ToolCard } from "@/lib/tools";
import { pageMetadata } from "@/lib/content";
import ToolGlyph from "@/components/tools/ToolGlyph";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: "/tools",
    pageKey: "tools",
    fallbackTitle: "Free Marketing & AI Tools for the GCC | With Hammad",
    fallbackDescription:
      "Free marketing & AI tools for the GCC: an ad-spend calculator, AEO citation checker, AI prompt generator, ad-copy writer, and image generator. No login.",
  });
}

const SITE = "https://withhammad.com";

// ItemList JSON-LD of every tool in the hub (GCC + AI). Internal tools resolve
// to absolute URLs; external tools already carry their full href.
const TOOLS_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free marketing & AI tools",
  itemListElement: [...GCC_TOOLS, ...AI_TOOLS].map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    description: tool.description,
    url: tool.href.startsWith("http") ? tool.href : `${SITE}${tool.href}`,
  })),
};

function HubCard({ tool, index }: { tool: ToolCard; index: number }) {
  const accent =
    tool.accent === "amber" ? "var(--accent-amber)" : "var(--accent-indigo)";

  const inner = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 z-0 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
        style={{ background: accent }}
      />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          {tool.icon ? (
            <span
              className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03]"
              style={{ color: accent }}
            >
              <ToolGlyph name={tool.icon} className="h-5 w-5" />
            </span>
          ) : (
            <span />
          )}
          {tool.duration ? (
            <span className="text-[11px] text-[var(--muted)]">
              {tool.duration}
            </span>
          ) : null}
        </div>
        <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[var(--muted)]">
          {tool.badge}
        </span>
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-[var(--text)]">
          {tool.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
          {tool.description}
        </p>
        <span
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-300 group-hover:gap-2.5"
          style={{ color: accent }}
        >
          {tool.external ? "Open" : "Try it"}{" "}
          <span aria-hidden>{tool.external ? "↗" : "→"}</span>
        </span>
      </div>
    </>
  );

  const cls =
    "group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25";

  return (
    <Reveal delay={index * 0.06} className="h-full">
      {tool.external ? (
        <a
          href={tool.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          {inner}
        </a>
      ) : (
        <Link href={tool.href} className={cls}>
          {inner}
        </Link>
      )}
    </Reveal>
  );
}

export default function ToolsHub() {
  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TOOLS_LD) }}
      />
      {/* Intro */}
      <section className="relative mx-auto max-w-6xl px-5 pb-8 pt-28 sm:px-8 sm:pt-32">
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
            Free tools
          </span>
          <h1
            className="mt-5 max-w-3xl font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", lineHeight: 1.03 }}
          >
            Free marketing tools, built to actually help.
          </h1>
          <p className="mt-5 max-w-2xl text-[var(--muted)] sm:text-lg">
            No fluff, no logins. Practical tools for founders and marketers —
            from GCC ad-spend math to AI-powered copy and creative.
          </p>
        </Reveal>
      </section>

      {/* GCC marketing tools */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">
                GCC marketing tools
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Built for the realities of advertising in the Gulf.
              </p>
            </div>
          </div>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GCC_TOOLS.map((tool, i) => (
            <HubCard key={tool.href} tool={tool} index={i} />
          ))}
        </div>
      </section>

      {/* AI tools */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">
              AI Tools
            </h2>
            <span className="rounded-full border border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent-amber)]">
              New
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            AI-powered tools to brief faster, write sharper, and create on brand.
          </p>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AI_TOOLS.map((tool, i) => (
            <HubCard key={tool.href} tool={tool} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)] p-8 text-center sm:p-12">
            <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
              Want these tools wired into your actual growth engine?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
              Book a free 30-minute call and we&apos;ll map the fastest path to
              predictable revenue.
            </p>
            <Link
              href="/#contact"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent-indigo)] px-7 text-sm font-medium text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]"
            >
              Book a Call
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
