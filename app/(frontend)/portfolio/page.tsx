import type { Metadata } from "next";
import Link from "next/link";
import {
  AI_SYSTEMS,
  CERTIFICATIONS,
  IN_PROGRESS,
  LANGUAGES,
  ROLES,
  SKILL_GROUPS,
} from "@/lib/ai-systems";
import PrintButton from "@/components/portfolio/PrintButton";
import { LINKEDIN_URL, PERSON_SAME_AS } from "@/lib/person";

const SITE = "https://withhammad.com";

export const metadata: Metadata = {
  title: "Portfolio — Hammad Yousuf | AI Marketing Automation Engineer",
  description:
    "Recruiter portfolio for Hammad Yousuf — AI Marketing Automation Engineer in Dubai. Production AI agents, multi-agent systems, and 6+ years of performance marketing results across the GCC.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio — Hammad Yousuf | AI Marketing Automation Engineer",
    description:
      "Production AI agents, multi-agent systems, and 6+ years of performance marketing results across the GCC.",
    type: "profile",
    url: "/portfolio",
    images: ["/ai/og-default.jpg"],
  },
  twitter: { card: "summary_large_image", images: ["/ai/og-default.jpg"] },
};

const HEADLINE_METRICS = [
  { value: "3,750", label: "Conversions on AED 42K spend" },
  { value: "+18%", label: "ROAS lift from autonomous agents" },
  { value: "−75%", label: "Manual optimisation time removed" },
  { value: "6+", label: "Years in performance marketing" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="print-heading mb-5 border-b border-white/10 pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
      {children}
    </h2>
  );
}

export default function PortfolioPage() {
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Hammad Yousuf",
    jobTitle: "AI Marketing Automation Engineer",
    email: "marketing@withhammad.com",
    url: SITE,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    sameAs: [...PERSON_SAME_AS],
    knowsAbout: [
      "AI agents",
      "Multi-agent systems",
      "Google Ads",
      "Meta Ads",
      "Performance marketing",
      "Marketing automation",
    ],
  };

  return (
    <main className="print-doc relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />

      <div className="mx-auto max-w-4xl px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
        {/* Header */}
        <header>
          <span className="print-hide inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
            Portfolio
          </span>
          <h1
            className="mt-5 font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.4rem)", lineHeight: 1.05 }}
          >
            Hammad Yousuf
          </h1>
          <p className="mt-3 text-lg font-medium text-[var(--text)]">
            AI Marketing Automation Engineer — Autonomous AI Agents &amp;
            Multi-Agent Systems
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Dubai, UAE · Open to UAE onsite/hybrid &amp; worldwide remote
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
            <a
              className="hover:text-[var(--accent)]"
              href="mailto:marketing@withhammad.com"
            >
              marketing@withhammad.com
            </a>
            <a
              className="hover:text-[var(--accent)]"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              linkedin.com/in/withhammad
            </a>
            <a className="hover:text-[var(--accent)]" href={SITE}>
              withhammad.com
            </a>
          </p>

          <div className="print-hide mt-7 flex flex-wrap gap-3">
            <PrintButton />
            <a
              href="/Hammad-Yousuf-CV.pdf"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-[var(--text)] transition-colors duration-300 hover:border-white/35"
            >
              Download CV
            </a>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-[var(--text)] transition-colors duration-300 hover:border-white/35"
            >
              Explore work in 3D
            </Link>
          </div>
        </header>

        {/* Headline metrics */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {HEADLINE_METRICS.map((m) => (
            <div
              key={m.label}
              className="print-card rounded-2xl border border-white/10 bg-[var(--panel)] p-5"
            >
              <div className="text-2xl font-semibold tracking-tight text-[var(--accent-2)]">
                {m.value}
              </div>
              <div className="mt-1 text-xs leading-snug text-[var(--muted)]">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <section className="mt-14">
          <SectionHeading>Professional summary</SectionHeading>
          <p className="text-[var(--muted)] leading-relaxed">
            I build production AI agents and agentic systems that autonomously
            run marketing operations. With 6+ years in performance marketing
            across Google Ads, Meta Ads and TikTok in the GCC, I&apos;ve
            delivered 3,750+ conversions on AED 42K spend, +18% ROAS, and
            significant CPA reduction — but my focus now is the intelligent
            systems behind those results.
          </p>
          <p className="mt-4 text-[var(--muted)] leading-relaxed">
            I design and deploy live AI agents using Claude Code, n8n + Model
            Context Protocol (MCP), RAG and multi-agent orchestration. These
            agents handle campaign optimisation, lead qualification, reporting
            and workflow automation — turning repetitive work into reliable,
            always-on systems. Google AI Professional and Google Ads AI-Powered
            Performance certified.
          </p>
        </section>

        {/* AI systems */}
        <section className="mt-14">
          <SectionHeading>Key AI projects &amp; systems</SectionHeading>
          <div className="space-y-4">
            {AI_SYSTEMS.map((s) => (
              <article
                key={s.id}
                className="print-card rounded-2xl border border-white/10 bg-[var(--panel)] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-medium text-[var(--text)]">{s.name}</h3>
                  <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    {s.status === "production"
                      ? "In production"
                      : "In development"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {s.summary}
                </p>
                {s.metric ? (
                  <p className="mt-3 text-sm">
                    <span className="font-semibold text-[var(--accent-2)]">
                      {s.metric}
                    </span>{" "}
                    <span className="text-[var(--muted)]">{s.metricLabel}</span>
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-[var(--muted)]">
                  {s.stack.join(" · ")}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            <span className="text-[var(--text)]">Currently building:</span>{" "}
            {IN_PROGRESS.join(" · ")}
          </p>
        </section>

        {/* Experience */}
        <section className="mt-14">
          <SectionHeading>Professional experience</SectionHeading>
          <div className="space-y-9">
            {ROLES.map((role) => (
              <article key={`${role.company}-${role.period}`}>
                <h3 className="font-medium text-[var(--text)]">{role.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {role.company} · {role.location} · {role.period}
                </p>
                <ul className="mt-3 space-y-2">
                  {role.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="relative pl-5 text-sm leading-relaxed text-[var(--muted)]"
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-[0.55em] h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="mt-14">
          <SectionHeading>Technical skills</SectionHeading>
          <div className="grid gap-6 sm:grid-cols-3">
            {SKILL_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-medium text-[var(--text)]">
                  {group.title}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="text-sm text-[var(--muted)]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Credentials */}
        <section className="mt-14">
          <SectionHeading>Certifications &amp; education</SectionHeading>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-[var(--text)]">
                Certifications
              </h3>
              <ul className="mt-3 space-y-1.5">
                {CERTIFICATIONS.map((c) => (
                  <li key={c} className="text-sm text-[var(--muted)]">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--text)]">
                Education &amp; languages
              </h3>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Higher National Certificate (HNC), Business Studies — Amity
                University, Dubai (2016)
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {LANGUAGES.join(" · ")}
              </p>
              <h3 className="mt-5 text-sm font-medium text-[var(--text)]">
                Recognition
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                YouTube Silver Play Button — 500,000+ subscribers
                (@with.hammad)
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="print-hide mt-16 rounded-2xl border border-white/10 bg-[var(--panel)] p-8 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text)]">
            Open to AI Marketing Automation, Performance Marketing and Growth
            roles.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--muted)]">
            UAE onsite/hybrid or worldwide remote. The fastest way to reach me
            is email — or book a call directly.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:marketing@withhammad.com"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Email me
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-[var(--text)] transition-colors duration-300 hover:border-white/35"
            >
              Contact page
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
