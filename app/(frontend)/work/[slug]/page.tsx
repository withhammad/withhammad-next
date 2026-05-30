import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCaseStudyBySlug, getCaseStudyIndex } from "@/lib/content";
import CaseStudyView from "@/components/sections/CaseStudyView";

export const revalidate = 300;

export async function generateStaticParams() {
  const index = await getCaseStudyIndex();
  return index.map((c) => ({ slug: c.slug }));
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
  const name =
    f?.showLogo === false
      ? f?.industry
        ? `${f.industry} client`
        : "Confidential client"
      : (f?.clientName ?? cs.title ?? "Case study");
  const desc = f?.heroMetric
    ? `${name}: ${f.heroMetric}${
        f.heroMetricLabel ? ` ${f.heroMetricLabel.toLowerCase()}` : ""
      }. A performance marketing case study by Hammad Yousuf.`
    : `${name} — a performance marketing case study by Hammad Yousuf.`;

  // Per-doc SEO override (admin → case study → SEO) wins over the auto meta.
  const title = cs.seo?.title?.trim() || `${name} — Case Study | Hammad Yousuf`;
  const description = cs.seo?.description?.trim() || desc;
  const ogUrl = cs.seo?.image ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: `${name} — Case Study`,
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

  return <CaseStudyView caseStudy={caseStudy} prev={prev} next={next} />;
}
