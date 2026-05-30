"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MetricNumber, MetricBar } from "@/components/ui/charts";
import GradientMesh from "@/components/ui/GradientMesh";
import MethodologyFlow from "@/components/sections/case-study/MethodologyFlow";
import ResultsBlock from "@/components/sections/case-study/ResultsBlock";
import {
  parseMetric,
  deriveBeforeAfter,
  parseChannels,
} from "@/lib/metrics";
import type { CaseStudyDetail, CaseStudyIndexItem } from "@/lib/wp-queries";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/withhammad-marketing/30min";
const PORTFOLIO_PDF = "/Hammad-Yousuf-Portfolio.pdf";

export default function CaseStudyView({
  caseStudy,
  prev,
  next,
}: {
  caseStudy: CaseStudyDetail;
  prev: CaseStudyIndexItem | null;
  next: CaseStudyIndexItem | null;
}) {
  const f = caseStudy.caseStudyFields;
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [heroPlay, setHeroPlay] = useState(false);

  const isSample = f?.isSample === true;
  const showRealName = isSample || f?.showLogo !== false;
  const displayName = showRealName
    ? (f?.clientName ?? caseStudy.title ?? "Case study")
    : f?.industry
      ? `${f.industry} client`
      : "Confidential client";
  const logoUrl = f?.showLogo ? (f.clientLogo?.node?.sourceUrl ?? null) : null;
  const services = caseStudy.serviceTypes?.nodes ?? [];
  const channels = parseChannels(f?.servicesUsed, services);

  const heroParsed = f?.heroMetric ? parseMetric(f.heroMetric) : null;
  const heroFraction = heroParsed
    ? heroParsed.isPercent
      ? Math.min(1, Math.abs(heroParsed.value) / 100)
      : 1
    : 0;

  const results = [
    { metric: f?.metric1, label: f?.label1 },
    { metric: f?.metric2, label: f?.label2 },
    { metric: f?.metric3, label: f?.label3 },
    { metric: f?.metric4, label: f?.label4 },
    { metric: f?.metric5, label: f?.label5 },
  ].filter((r): r is { metric: string; label: string | null } =>
    Boolean(r.metric && r.metric.trim()),
  );

  const beforeAfter = deriveBeforeAfter([
    { metric: f?.heroMetric ?? null, label: f?.heroMetricLabel ?? null },
    ...results.map((r) => ({ metric: r.metric, label: r.label })),
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount reveal cue (SSR-safe)
    setHeroPlay(true);
  }, []);

  useGSAP(
    () => {
      if (reduced) return;
      const reveals = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        rootRef.current,
      );
      reveals.forEach((el) => {
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <div ref={rootRef} className="flex flex-1 flex-col">
      {/* ---------------- Hero ---------------- */}
      <section className="relative -mt-16 flex min-h-[78svh] flex-col justify-end overflow-hidden px-5 pb-14 pt-28 sm:px-8">
        <GradientMesh />
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href="/#selected-work"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            <span aria-hidden>←</span> All work
          </Link>

          {isSample ? (
            <div className="mt-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--accent-amber)]/50 bg-[color-mix(in_oklab,var(--accent-amber)_8%,transparent)] px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-[var(--accent-amber)]">
                Sample project — illustrative
              </span>
              <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
                Demonstrates methodology. The company is illustrative and the
                metrics are modeled / representative — not a real client
                engagement.
              </p>
            </div>
          ) : null}

          {/* Channel chips */}
          {channels.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {channels.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-[color-mix(in_oklab,var(--panel)_70%,transparent)] px-3 py-1 text-xs text-[var(--text)] backdrop-blur"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-indigo)]" />
                  {c}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1
                className="font-semibold tracking-tight text-[var(--text)]"
                style={{
                  fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                  lineHeight: 1.02,
                }}
              >
                {displayName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--muted)]">
                {f?.industry ? <span>{f.industry}</span> : null}
                {f?.industry && f?.servicesUsed ? (
                  <span className="text-white/20">·</span>
                ) : null}
                {f?.servicesUsed ? <span>{f.servicesUsed}</span> : null}
              </div>
              {logoUrl ? (
                <span className="relative mt-5 block h-9 w-28">
                  <Image
                    src={logoUrl}
                    alt={f?.clientName ? `${f.clientName} logo` : "Client logo"}
                    fill
                    sizes="112px"
                    className="object-contain object-left opacity-90"
                  />
                </span>
              ) : null}
            </div>

            {f?.heroMetric ? (
              <div className="lg:text-right">
                <div
                  className="font-semibold leading-none tracking-tight text-[var(--accent-amber)]"
                  style={{ fontSize: "clamp(3.5rem, 11vw, 8rem)" }}
                >
                  <MetricNumber raw={f.heroMetric} play={heroPlay} />
                </div>
                {f.heroMetricLabel ? (
                  <div className="mt-2 text-[var(--muted)]">
                    {f.heroMetricLabel}
                  </div>
                ) : null}
                <div className="mt-4 lg:ml-auto lg:max-w-[280px]">
                  <MetricBar fraction={heroFraction} play={heroPlay} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------------- The Challenge ---------------- */}
      {f?.theChallenge && f.theChallenge.trim() ? (
        <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div
            data-reveal
            className="grid gap-6 border-t border-white/10 py-12 sm:py-16 lg:grid-cols-[300px_1fr]"
          >
            <div className="self-start lg:sticky lg:top-24">
              <span className="font-mono text-sm text-[var(--accent-indigo)]">
                01
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">
                The Challenge
              </h2>
            </div>
            <p className="max-w-2xl whitespace-pre-line text-lg leading-relaxed text-[var(--muted)]">
              {f.theChallenge}
            </p>
          </div>
        </section>
      ) : null}

      {/* ---------------- Methodology (Strategy + Execution) ---------------- */}
      <MethodologyFlow
        strategy={f?.theStrategy ?? null}
        execution={f?.theExecution ?? null}
      />

      {/* ---------------- Results (before/after + metric viz) ---------------- */}
      <ResultsBlock results={results} beforeAfter={beforeAfter} />

      {/* ---------------- Testimonial (only if present) ---------------- */}
      {f?.testimonialQuote && f.testimonialQuote.trim() ? (
        <section
          data-reveal
          className="mx-auto w-full max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-20"
        >
          <blockquote
            className="font-medium tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: 1.3 }}
          >
            &ldquo;{f.testimonialQuote}&rdquo;
          </blockquote>
          {f.testimonialName ? (
            <div className="mt-6 text-[var(--muted)]">
              <span className="text-[var(--text)]">{f.testimonialName}</span>
              {f.testimonialTitle ? ` · ${f.testimonialTitle}` : ""}
              {f.testimonialLinkedin ? (
                <>
                  {" · "}
                  <a
                    href={f.testimonialLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-indigo)] hover:underline"
                  >
                    LinkedIn
                  </a>
                </>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ---------------- End CTA ---------------- */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)] p-8 text-center sm:p-12">
          <h2
            className="font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
          >
            Want results like these?
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent-indigo)] px-6 text-sm font-medium text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]"
            >
              Book a call
            </a>
            <Link
              href="/#services"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-[var(--text)] transition-colors hover:border-white/40 hover:bg-white/5"
            >
              View related service
            </Link>
            <a
              href={PORTFOLIO_PDF}
              download
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-[var(--text)] transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Download portfolio PDF
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- Prev / Next ---------------- */}
      {prev || next ? (
        <nav className="mx-auto mb-8 flex w-full max-w-6xl items-stretch justify-between gap-4 px-5 sm:px-8">
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              className="group flex-1 rounded-2xl border border-white/10 bg-[var(--panel)] p-5 transition-colors hover:border-white/25"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                ← Previous
              </div>
              <div className="mt-1 font-medium text-[var(--text)]">
                {prev.title}
              </div>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="group flex-1 rounded-2xl border border-white/10 bg-[var(--panel)] p-5 text-right transition-colors hover:border-white/25"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Next →
              </div>
              <div className="mt-1 font-medium text-[var(--text)]">
                {next.title}
              </div>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </nav>
      ) : null}
    </div>
  );
}
