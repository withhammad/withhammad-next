"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  SERVICE_FILTERS,
  caseStudyMatchesFilter,
  type CaseStudyCard,
  type ServiceFilter,
} from "@/lib/wp-queries";
import { MetricBar } from "@/components/ui/charts";
import { parseMetric } from "@/lib/metrics";

export default function SelectedWork({
  caseStudies,
}: {
  caseStudies: CaseStudyCard[];
}) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<ServiceFilter>("All");

  // Real client work vs clearly-labeled illustrative samples — kept separate.
  const realCaseStudies = useMemo(
    () => caseStudies.filter((cs) => cs.caseStudyFields?.isSample !== true),
    [caseStudies],
  );
  const sampleCaseStudies = useMemo(
    () => caseStudies.filter((cs) => cs.caseStudyFields?.isSample === true),
    [caseStudies],
  );

  const isEmpty = realCaseStudies.length === 0;

  const filtered = useMemo(
    () => realCaseStudies.filter((cs) => caseStudyMatchesFilter(cs, filter)),
    [realCaseStudies, filter],
  );

  // Which service filters actually have real content (hide empty ones).
  const availableFilters = useMemo(() => {
    return SERVICE_FILTERS.filter(
      (f) =>
        f === "All" ||
        realCaseStudies.some((cs) => caseStudyMatchesFilter(cs, f)),
    );
  }, [realCaseStudies]);

  // Scroll-reveal the header + filter bar (no-op under reduced-motion).
  useGSAP(
    () => {
      if (reduced) return;
      const els = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        sectionRef.current,
      );
      els.forEach((el) => {
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: sectionRef, dependencies: [reduced, isEmpty] },
  );

  const useMarquee = filter === "All" && !reduced && filtered.length > 1;

  return (
    <section
      ref={sectionRef}
      id="selected-work"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto mb-10 max-w-7xl px-5 sm:px-8">
        <span
          data-reveal
          className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-indigo)]" />
          Selected Work
        </span>
        <h2
          data-reveal
          className="max-w-2xl font-semibold tracking-tight text-[var(--text)]"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", lineHeight: 1.05 }}
        >
          Proof, not promises.
        </h2>
        <p data-reveal className="mt-4 max-w-xl text-[var(--muted)]">
          Real campaigns, real numbers — across PPC, SEO, paid social, CRO, and
          multi-market growth in the GCC and beyond.
        </p>
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {availableFilters.length > 1 && (
            <div
              data-reveal
              className="mx-auto mb-8 flex max-w-7xl flex-wrap gap-2 px-5 sm:px-8"
            >
              {availableFilters.map((f) => {
                const active = f === filter;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    aria-pressed={active}
                    className={
                      "rounded-full border px-4 py-1.5 text-sm transition-colors " +
                      (active
                        ? "border-[var(--accent-indigo)] bg-[var(--accent-indigo)] text-white"
                        : "border-white/15 text-[var(--muted)] hover:border-white/40 hover:text-[var(--text)]")
                    }
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          )}

          {useMarquee ? (
            <Marquee items={filtered} />
          ) : (
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              {filtered.length === 0 ? (
                <p className="py-12 text-center text-[var(--muted)]">
                  No case studies in this category yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((cs) => (
                    <CaseCard key={cs.id} cs={cs} variant="grid" />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {sampleCaseStudies.length > 0 && (
        <div className="mx-auto mt-20 max-w-7xl px-5 sm:px-8">
          <div data-reveal className="mb-6">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-dashed border-white/25 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
              Sample Projects
            </span>
            <p className="max-w-xl text-sm text-[var(--muted)]">
              Illustrative builds that demonstrate methodology — not real client
              engagements. Companies and metrics are representative.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sampleCaseStudies.map((cs) => (
              <CaseCard key={cs.id} cs={cs} variant="grid" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------------- Marquee -------------------------------- */

function Marquee({ items }: { items: CaseStudyCard[] }) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (!trackRef.current) return;
      tweenRef.current = gsap.to(trackRef.current, {
        xPercent: -50, // track is the list duplicated → -50% = one seamless loop
        ease: "none",
        duration: Math.max(20, items.length * 7),
        repeat: -1,
      });
    },
    { scope: scopeRef, dependencies: [items.length] },
  );

  const pause = () => tweenRef.current?.pause();
  const resume = () => tweenRef.current?.play();

  return (
    <div
      ref={scopeRef}
      className="relative overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28"
        style={{
          background:
            "linear-gradient(to right, var(--bg), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28"
        style={{
          background: "linear-gradient(to left, var(--bg), transparent)",
        }}
      />
      <div ref={trackRef} className="flex w-max gap-5 px-5 sm:px-8">
        {items.map((cs) => (
          <CaseCard key={`a-${cs.id}`} cs={cs} variant="marquee" />
        ))}
        {items.map((cs) => (
          <CaseCard
            key={`b-${cs.id}`}
            cs={cs}
            variant="marquee"
            duplicate
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Card ---------------------------------- */

function CaseCard({
  cs,
  variant,
  duplicate = false,
}: {
  cs: CaseStudyCard;
  variant: "marquee" | "grid";
  duplicate?: boolean;
}) {
  const f = cs.caseStudyFields;
  const hero = !!f?.isHero;
  const isSample = f?.isSample === true;
  const services = cs.serviceTypes?.nodes ?? [];
  const logoUrl = f?.showLogo ? (f.clientLogo?.node?.sourceUrl ?? null) : null;
  // Samples carry a pre-anonymized clientName, so only anonymize REAL work.
  const anonymize = !isSample && f?.showLogo === false;
  const heroP = parseMetric(f?.heroMetric ?? null);
  const metricFrac = heroP
    ? heroP.isPercent
      ? Math.min(1, Math.abs(heroP.value) / 100)
      : 1
    : 1;

  const sizeClass =
    variant === "marquee"
      ? hero
        ? "w-[clamp(300px,82vw,460px)] h-[clamp(360px,52vh,460px)]"
        : "w-[clamp(260px,72vw,340px)] h-[clamp(360px,52vh,460px)]"
      : hero
        ? "sm:col-span-2 lg:col-span-2 aspect-[16/10]"
        : "aspect-[4/5]";

  return (
    <Link
      href={`/work/${cs.slug}`}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
      className={
        "group relative block shrink-0 overflow-hidden rounded-2xl border border-white/10 " +
        sizeClass
      }
    >
      {/* Visual layer (zooms on hover) */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 0%, color-mix(in oklab, var(--accent-indigo) 22%, var(--panel)) 0%, var(--panel) 55%)",
        }}
      />
      {/* darken toward bottom for legibility */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, color-mix(in oklab, var(--bg) 85%, transparent), transparent 55%)",
        }}
      />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {services.slice(0, 2).map((s) => (
              <span
                key={s.slug}
                className="rounded-full border border-white/15 bg-black/20 px-2 py-0.5 text-[11px] text-[var(--muted)]"
              >
                {s.name}
              </span>
            ))}
          </div>
          {isSample ? (
            <span className="shrink-0 rounded-full border border-dashed border-[var(--accent-amber)]/50 bg-[color-mix(in_oklab,var(--accent-amber)_8%,transparent)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent-amber)]">
              Sample · illustrative
            </span>
          ) : logoUrl ? (
            <span className="relative h-8 w-16 shrink-0">
              <Image
                src={logoUrl}
                alt={f?.clientName ? `${f.clientName} logo` : "Client logo"}
                fill
                sizes="64px"
                className="object-contain object-right opacity-90"
              />
            </span>
          ) : null}
        </div>

        <div>
          <div
            className="font-semibold tracking-tight text-[var(--accent-amber)]"
            style={{ fontSize: hero ? "clamp(2.4rem, 5vw, 3.6rem)" : "clamp(2rem, 4vw, 2.8rem)" }}
          >
            {f?.heroMetric ?? "—"}
          </div>
          <div className="mt-2 max-w-[150px]">
            <MetricBar fraction={metricFrac} play />
          </div>
          {f?.heroMetricLabel ? (
            <div className="mt-2 text-sm text-[var(--muted)]">
              {f.heroMetricLabel}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-2 text-[var(--text)]">
            <span className="font-medium">
              {anonymize
                ? f?.industry
                  ? `${f.industry} client`
                  : "Confidential client"
                : (f?.clientName ?? cs.title ?? "Case study")}
            </span>
          </div>
          {f?.industry && !anonymize ? (
            <div className="text-sm text-[var(--muted)]">{f.industry}</div>
          ) : null}
        </div>
      </div>

      {/* Hover overlay: title reveal + CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-[color-mix(in_oklab,var(--accent-indigo)_92%,black)] px-6 py-4 transition-transform duration-300 ease-out group-hover:translate-y-0">
        <div className="flex items-center justify-between gap-3 text-white">
          <span className="line-clamp-1 text-sm font-medium">
            {cs.title ?? f?.clientName ?? "View case study"}
          </span>
          <span aria-hidden className="text-sm">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------ Empty state ------------------------------ */

function EmptyState() {
  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="mb-6 rounded-xl border border-dashed border-white/15 bg-[var(--panel)]/40 px-5 py-4 text-sm text-[var(--muted)]">
        Selected work publishes from the CMS — this section fills in
        automatically once case studies go live at{" "}
        <code className="text-[var(--text)]">cms.withhammad.com</code>.
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)]">
      <div className="flex h-full animate-pulse flex-col justify-between p-6">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-white/5" />
          <div className="h-5 w-12 rounded-full bg-white/5" />
        </div>
        <div className="space-y-3">
          <div className="h-10 w-2/3 rounded bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-white/5" />
          <div className="h-4 w-1/3 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
