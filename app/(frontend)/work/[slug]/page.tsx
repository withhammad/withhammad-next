import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCaseStudyBySlug, getCaseStudyIndex } from "@/lib/content";
import type { CaseStudyDetail } from "@/lib/wp-queries";
import CaseStudyView from "@/components/sections/CaseStudyView";
import { clamp } from "@/lib/text";

export const revalidate = 300;

const SITE = "https://withhammad.com";

export async function generateStaticParams() {
  const index = await getCaseStudyIndex();
  return index.map((c) => ({ slug: c.slug }));
}

// Display name respects anonymized clients; metric suffix adds the headline result.
function displayName(cs: CaseStudyDetail): string {
  const f = cs.caseStudyFields;
  return f?.showLogo === false
    ? f?.industry
      ? `${f.industry} client`
      : "Confidential client"
    : (f?.clientName ?? cs.title ?? "Case study");
}
function metricSuffix(cs: CaseStudyDetail): string {
  const f = cs.caseStudyFields;
  return f?.heroMetric
    ? ` — ${f.heroMetric}${f.heroMetricLabel ? ` ${f.heroMetricLabel}` : ""}`
    : "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = await getCaseStudyBySlug(slug);
  if (!cs) return { title: "Case study — Hammad Yousuf" };

  const f = cs.caseStudyFields;
  const name = displayName(cs);
  const metric = metricSuffix(cs);
  const desc = f?.heroMetric
    ? clamp(
        `${name}: ${f.heroMetric}${
          f.heroMetricLabel ? ` ${f.heroMetricLabel.toLowerCase()}` : ""
        }${
          f.servicesUsed ? ` via ${f.servicesUsed}` : ""
        }. A performance-marketing case study by Hammad Yousuf — the strategy, structure, and results.`,
      )
    : `${name} — a performance-marketing case study by Hammad Yousuf: the challenge, strategy, execution, and measurable results.`;

  // Per-doc SEO override (admin → case study → SEO) wins over the auto meta.
  const title = cs.seo?.title?.trim() || `${name} Case Study${metric} | With Hammad`;
  const description = cs.seo?.description?.trim() || desc;
  const ogUrl = cs.seo?.image ?? undefined; // else the per-route opengraph-image is used

  return {
    title,
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: `${name} Case Study`,
      description,
      type: "article",
      url: `/work/${slug}`,
      ...(ogUrl ? { images: [{ url: ogUrl }] } : {}),
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [caseStudy, index] = await Promise.all([
    getCaseStudyBySlug(slug),
    getCaseStudyIndex(),
  ]);

  if (!caseStudy) notFound();

  // Prev/next stays within the same group — real work links to real work,
  // samples link to samples, so the two never mix in navigation.
  const current = index.find((c) => c.slug === slug);
  const group = index.filter(
    (c) => c.isSample === (current?.isSample ?? false),
  );
  const gi = group.findIndex((c) => c.slug === slug);
  const prev = gi > 0 ? group[gi - 1] : null;
  const next = gi >= 0 && gi < group.length - 1 ? group[gi + 1] : null;

  const f = caseStudy.caseStudyFields;
  const name = displayName(caseStudy);
  const metric = metricSuffix(caseStudy);

  // Article JSON-LD. NOTE: no Review/Rating schema — testimonials are
  // intentionally null placeholders (never ship drafted quotes as real reviews).
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${name} Case Study${metric}`,
    ...(f?.servicesUsed ? { about: f.servicesUsed } : {}),
    author: { "@type": "Person", name: "Hammad Yousuf", url: SITE },
    publisher: { "@type": "Person", name: "Hammad Yousuf" },
    image: `${SITE}/work/${slug}/opengraph-image`,
    mainEntityOfPage: `${SITE}/work/${slug}`,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Work", item: `${SITE}/work` },
      { "@type": "ListItem", position: 3, name },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <CaseStudyView caseStudy={caseStudy} prev={prev} next={next} />
    </>
  );
}
