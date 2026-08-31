import type { Metadata } from "next";
import Link from "next/link";
import { AGENTS } from "@/lib/agents";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "AI Agents — Production Systems | With Hammad",
  description: "73 production AI agents powering autonomous marketing operations across SEO, sales, pricing, and content systems.",
  alternates: { canonical: "/agents" },
  openGraph: {
    title: "73 AI Agents Running Production",
    description: "Autonomous agents that handle research, drafting, auditing, optimization, sales outreach, pricing, and content operations — no human in the loop.",
    type: "website",
    url: "/agents",
    images: ["/ai/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ai/og-default.jpg"],
  },
};

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      aria-label={`View ${agent.name} agent details`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
    >
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-indigo)]/20 to-[var(--accent-amber)]/20 text-2xl transition-all duration-300 group-hover:from-[var(--accent-indigo)]/40 group-hover:to-[var(--accent-amber)]/40">
            {agent.emoji}
          </div>
          <div>
            <h3 className="font-semibold tracking-tight text-[var(--text)] transition-colors group-hover:text-[var(--accent)]" style={{ fontSize: "clamp(1.3rem, 3vw, 1.6rem)" }}>
              {agent.name}
            </h3>
            <span className="mt-1 inline-block rounded-full bg-[var(--accent-indigo)]/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[var(--accent-indigo)]">
              {agent.role}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--muted)] line-clamp-4">{agent.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {agent.stack.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] transition-colors hover:text-[var(--accent-soft)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            STATUS: {agent.status.toUpperCase()}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--accent-soft)]">
            {agent.metrics}
          </span>
        </div>
      </div>
    </Link>
  );
}

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Production AI Agents",
  numberOfItems: AGENTS.length,
  itemListElement: AGENTS.map((agent, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: agent.name,
    description: agent.description,
  })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://withhammad.com" },
    { "@type": "ListItem", position: 2, name: "Agents" },
  ],
};

export default function AgentsPage() {
  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="mx-auto max-w-6xl px-5 pb-8 pt-28 sm:px-8 sm:pt-32">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Agent OS
        </span>
        <h1
          className="mt-5 max-w-3xl font-semibold tracking-tight text-[var(--text)]"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", lineHeight: 1.04 }}
        >
          73 AI agents running production.
        </h1>
        <p className="mt-5 max-w-2xl text-[var(--muted)] sm:text-lg">
          Autonomous agents that handle research, drafting, auditing, optimization, sales outreach, pricing, and content operations — no human in the loop.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>
    </main>
  );
}
