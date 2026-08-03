import type { Metadata } from "next";
import MissionIndex from "@/components/missions/MissionIndex";
import HorizontalShowcase from "@/components/missions/HorizontalShowcase";
import { PROJECTS } from "@/lib/projects";
import { SITE_URL } from "@/lib/person";

export const metadata: Metadata = {
  title: "Missions — Production AI Agents & Systems | Hammad Yousuf",
  description:
    "Eight production AI systems built by Hammad Yousuf, AI Marketing Automation Engineer in Dubai — autonomous agents for SEO, sales outreach, estimation, pricing and paid media.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Missions — Production AI Agents & Systems",
    description:
      "Eight production AI systems: JARVIS, IBRAHIM, Adam, Atlas, an autonomous Google Ads agent, and more.",
    type: "website",
    url: "/projects",
    images: ["/ai/og-default.jpg"],
  },
  twitter: { card: "summary_large_image", images: ["/ai/og-default.jpg"] },
};

export default function ProjectsPage() {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI systems built by Hammad Yousuf",
    itemListElement: PROJECTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/projects/${p.slug}`,
      name: p.name,
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Missions" },
    ],
  };

  return (
    <main className="relative" data-hud-section="MISSIONS">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-28 sm:px-8 sm:pt-36">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]">
          02 / Missions
        </span>
        <h1
          className="font-display mt-6 max-w-4xl font-semibold uppercase leading-[0.92] text-[var(--text)]"
          style={{ fontSize: "clamp(2.8rem, 8vw, 7rem)" }}
        >
          Systems that
          <br />
          <span className="text-[var(--accent)]">run themselves</span>
        </h1>
        <p className="mt-7 max-w-2xl text-[var(--muted)] sm:text-lg">
          Eight production AI systems — agents that prospect, price, optimise
          and publish without being asked twice. Every one built end to end:
          architecture, code, deployment, and the numbers that came out.
        </p>
      </section>

      {/* Featured — vertical scroll drives horizontal travel on desktop */}
      <section className="border-y border-[var(--line)]">
        <HorizontalShowcase />
      </section>

      {/* Full mission select */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2
            className="font-display font-semibold uppercase leading-none text-[var(--text)]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
          >
            All missions
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
            {PROJECTS.length} systems
          </span>
        </div>
        <MissionIndex />
      </section>
    </main>
  );
}
