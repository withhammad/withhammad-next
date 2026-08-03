import type { Metadata } from "next";
import Link from "next/link";
import { getCaseStudies } from "@/lib/content";
import type { CaseStudyCard } from "@/lib/wp-queries";
import GradientCover from "@/components/ui/GradientCover";
import AISystemsSection from "@/components/work/AISystemsSection";

export const revalidate = 300;
const SITE = "https://withhammad.com";

export const metadata: Metadata = {
  title: "Work — Case Studies & Production AI Systems | With Hammad",
  description:
    "Performance-marketing case studies across Google Ads, Meta, SEO, CRO and multi-market growth — plus the production AI agents and multi-agent systems behind them.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Case Studies — Real Campaigns, Real Numbers",
    description:
      "Performance-marketing case studies across Google Ads, Meta, SEO, CRO, and multi-market growth — real campaigns, real numbers.",
    type: "website",
    url: "/work",
    images: ["/ai/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ai/og-default.jpg"],
  },
};

function csName(cs: CaseStudyCard): string {
  const f = cs.caseStudyFields;
  if (f?.isSample) return f.clientName ?? cs.title ?? "Sample project";
  return f?.showLogo === false
    ? f?.industry
      ? `${f.industry} client`
      : "Confidential client"
    : (f?.clientName ?? cs.title ?? "Case study");
}
function anchorText(cs: CaseStudyCard): string {
  const f = cs.caseStudyFields;
  const metric = f?.heroMetric
    ? ` — ${f.heroMetric}${f.heroMetricLabel ? ` ${f.heroMetricLabel}` : ""}`
    : "";
  return `${csName(cs)} case study${metric}`;
}

function WorkCard({ cs, sample }: { cs: CaseStudyCard; sample?: boolean }) {
  const f = cs.caseStudyFields;
  const service = cs.serviceTypes?.nodes?.[0]?.name;
  return (
    <Link
      href={`/work/${cs.slug}`}
      aria-label={anchorText(cs)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
          <GradientCover
            seed={cs.slug}
            category={service}
            variant="card"
            animate={false}
          />
        </div>
        {sample ? (
          <span className="absolute left-3 top-3 rounded-full border border-dashed border-[var(--accent-amber)]/50 bg-black/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent-amber)] backdrop-blur">
            Sample · illustrative
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {f?.heroMetric ? (
          <div
            className="font-semibold tracking-tight text-[var(--accent-amber)]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
          >
            {f.heroMetric}
          </div>
        ) : null}
        {f?.heroMetricLabel ? (
          <div className="mt-1 text-sm text-[var(--muted)]">
            {f.heroMetricLabel}
          </div>
        ) : null}
        <div className="mt-4 font-medium text-[var(--text)]">{csName(cs)}</div>
        {f?.industry && f?.showLogo !== false ? (
          <div className="text-sm text-[var(--muted)]">{f.industry}</div>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-indigo)] transition-all duration-300 group-hover:gap-2.5">
          Read case study <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

export default async function WorkIndexPage() {
  const caseStudies = await getCaseStudies();
  const real = caseStudies.filter((cs) => cs.caseStudyFields?.isSample !== true);
  const samples = caseStudies.filter(
    (cs) => cs.caseStudyFields?.isSample === true,
  );

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Case studies — With Hammad",
    itemListElement: real.map((cs, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/work/${cs.slug}`,
      name: anchorText(cs),
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Work" },
    ],
  };

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
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-indigo)]" />
          Case Studies
        </span>
        <h1
          className="mt-5 max-w-3xl font-semibold tracking-tight text-[var(--text)]"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", lineHeight: 1.04 }}
        >
          Proof, not promises.
        </h1>
        <p className="mt-5 max-w-2xl text-[var(--muted)] sm:text-lg">
          Real campaigns, real numbers — across Google Ads, Meta, SEO, CRO, and
          multi-market growth in the GCC and beyond.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {real.map((cs) => (
            <WorkCard key={cs.id} cs={cs} />
          ))}
        </div>

        {samples.length > 0 ? (
          <div className="mt-16">
            <h2 className="mb-2 text-lg font-semibold tracking-tight text-[var(--text)]">
              Sample projects
            </h2>
            <p className="mb-6 max-w-xl text-sm text-[var(--muted)]">
              Illustrative builds that demonstrate methodology — companies and
              metrics are representative, not real client engagements.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {samples.map((cs) => (
                <WorkCard key={cs.id} cs={cs} sample />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="border-t border-white/8">
        <AISystemsSection />
      </div>
    </main>
  );
}
