"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { splitSteps } from "@/lib/metrics";

const COMMON = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5",
  "aria-hidden": true,
};

function StepIcon({ index }: { index: number }) {
  const kind = index % 5;
  if (kind === 0)
    return (
      <svg {...COMMON}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ); // audit / search
  if (kind === 1)
    return (
      <svg {...COMMON}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2-2 2.7-2.7z" />
      </svg>
    ); // build / wrench
  if (kind === 2)
    return (
      <svg {...COMMON}>
        <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />
      </svg>
    ); // filter
  if (kind === 3)
    return (
      <svg {...COMMON}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M17 7h4v4" />
      </svg>
    ); // scale / trend
  return (
    <svg {...COMMON}>
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" rx="0.5" />
      <rect x="13" y="7" width="3" height="10" rx="0.5" />
    </svg>
  ); // report / bars
}

export default function MethodologyFlow({
  strategy,
  execution,
}: {
  strategy: string | null;
  execution: string | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const steps = splitSteps(execution);
  const hasStrategy = !!(strategy && strategy.trim());

  useGSAP(
    () => {
      if (reduced) return;
      const els = gsap.utils.toArray<HTMLElement>(
        "[data-flow-reveal]",
        ref.current,
      );
      els.forEach((el) => {
        gsap.from(el, {
          y: 24,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: ref, dependencies: [reduced] },
  );

  if (!hasStrategy && steps.length === 0) return null;

  return (
    <section
      ref={ref}
      className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
    >
      <span
        data-flow-reveal
        className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        How it worked
      </span>

      {hasStrategy ? (
        <div
          data-flow-reveal
          className="mb-12 overflow-hidden rounded-2xl border border-white/10 bg-[var(--panel)] p-6 sm:p-8"
        >
          <div className="mb-2 text-xs uppercase tracking-[0.15em] text-[var(--accent)]">
            The Strategy
          </div>
          <p className="max-w-3xl text-lg leading-relaxed text-[var(--text)]">
            {strategy}
          </p>
        </div>
      ) : null}

      {steps.length > 0 ? (
        <div>
          <div
            data-flow-reveal
            className="mb-6 text-xs uppercase tracking-[0.15em] text-[var(--muted)]"
          >
            The Execution
          </div>
          <ol className="relative space-y-5">
            <span
              aria-hidden
              className="absolute bottom-4 left-[19px] top-4 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, color-mix(in oklab, var(--accent-2) 40%, transparent), rgba(255,255,255,0.08) 30%, transparent)",
              }}
            />
            {steps.map((step, i) => (
              <li key={i} data-flow-reveal className="relative flex gap-4">
                <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-[var(--bg)] text-[var(--accent-2)]">
                  <StepIcon index={i} />
                </span>
                <div className="pt-1">
                  <div className="font-mono text-xs text-[var(--muted)]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="mt-1 max-w-2xl leading-relaxed text-[var(--muted)]">
                    {step}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
