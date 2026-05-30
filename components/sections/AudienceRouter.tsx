"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type AudienceKey = "founders" | "agencies" | "recruiters";

type Audience = {
  key: AudienceKey;
  eyebrow?: string;
  title: string;
  desc: string;
  points: string[];
  cta: string;
  href: string;
  primary?: boolean;
};

const AUDIENCES: Record<AudienceKey, Audience> = {
  founders: {
    key: "founders",
    eyebrow: "Start here",
    title: "For Founders & Owners",
    desc: "Done-for-you growth without building an in-house team — one partner who owns the funnel end to end and reports in revenue, not vanity metrics.",
    points: [
      "$999/mo productized growth service",
      "Audit → Build → Scale → Report",
      "AI-accelerated creative & media buying",
    ],
    cta: "See the growth service",
    href: "#services",
    primary: true,
  },
  agencies: {
    key: "agencies",
    title: "For Agencies & GCC Enterprises",
    desc: "White-label performance and multi-market campaigns across the GCC — Arabic + English, four markets, one senior operator.",
    points: [],
    cta: "Let's partner",
    href: "#contact",
  },
  recruiters: {
    key: "recruiters",
    title: "For Recruiters",
    desc: "A senior AI-driven growth & performance marketer with a public track record and a 540K audience built from scratch.",
    points: [],
    cta: "View experience",
    href: "#about",
  },
};

export default function AudienceRouter() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const heads = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        sectionRef.current,
      );
      gsap.from(heads, {
        y: 26,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });

      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-card]",
        sectionRef.current,
      );
      gsap.from(cards, {
        y: 34,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: cards[0], start: "top 85%" },
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section
      ref={sectionRef}
      id="audience"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="mb-10 max-w-2xl">
          <span
            data-reveal
            className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-indigo)]" />
            Who I work with
          </span>
          <h2
            data-reveal
            className="font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", lineHeight: 1.05 }}
          >
            Find your path.
          </h2>
          <p data-reveal className="mt-4 text-[var(--muted)]">
            However you landed here, there&apos;s a track built for you.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <AudienceCard audience={AUDIENCES.founders} className="lg:col-span-2" />
          <div className="grid gap-5 lg:grid-rows-2">
            <AudienceCard audience={AUDIENCES.agencies} />
            <AudienceCard audience={AUDIENCES.recruiters} />
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceCard({
  audience,
  className = "",
}: {
  audience: Audience;
  className?: string;
}) {
  const { primary } = audience;
  return (
    <a
      data-card
      href={audience.href}
      className={
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] p-6 transition-[transform,border-color,background-color] duration-300 will-change-transform hover:-translate-y-1 hover:border-white/25 sm:p-8 " +
        (primary ? "min-h-[420px]" : "min-h-[200px]") +
        " " +
        className
      }
    >
      {/* Accent glow (primary only), intensifies on hover */}
      {primary ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
          style={{
            background:
              "radial-gradient(circle at center, var(--accent-indigo), transparent 65%)",
          }}
        />
      ) : null}

      <div className="relative flex items-center justify-between">
        <span
          className={
            "inline-grid place-items-center rounded-xl border border-white/10 transition-colors group-hover:border-white/25 " +
            (primary ? "h-12 w-12 text-[var(--accent-indigo)]" : "h-10 w-10 text-[var(--muted)] group-hover:text-[var(--text)]")
          }
        >
          <AudienceIcon kind={audience.key} />
        </span>
        {audience.eyebrow ? (
          <span className="rounded-full border border-[var(--accent-indigo)]/40 bg-[var(--accent-indigo)]/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-[var(--accent-indigo)]">
            {audience.eyebrow}
          </span>
        ) : null}
      </div>

      <h3
        className="relative mt-5 font-semibold tracking-tight text-[var(--text)]"
        style={{
          fontSize: primary ? "clamp(1.6rem, 2.6vw, 2.25rem)" : "1.25rem",
        }}
      >
        {audience.title}
      </h3>
      <p
        className={
          "relative mt-2 text-[var(--muted)] " +
          (primary ? "max-w-md text-base" : "text-sm")
        }
      >
        {audience.desc}
      </p>

      {primary && audience.points.length > 0 ? (
        <ul className="relative mt-6 space-y-2">
          {audience.points.map((p) => (
            <li
              key={p}
              className="flex items-center gap-3 text-sm text-[var(--text)]"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-amber)]" />
              {p}
            </li>
          ))}
        </ul>
      ) : null}

      <span
        className={
          "relative mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium " +
          (primary ? "text-[var(--text)]" : "text-[var(--muted)] group-hover:text-[var(--text)]")
        }
      >
        {audience.cta}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </a>
  );
}

function AudienceIcon({ kind }: { kind: AudienceKey }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
    "aria-hidden": true,
  };
  if (kind === "founders") {
    return (
      <svg {...common}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    );
  }
  if (kind === "agencies") {
    return (
      <svg {...common}>
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
