"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MetricNumber, MetricBar, Donut } from "@/components/ui/charts";
import { parseMetric, metricFractions, type BeforeAfter } from "@/lib/metrics";

type Result = { metric: string; label: string | null };

export default function ResultsBlock({
  results,
  beforeAfter,
}: {
  results: Result[];
  beforeAfter: BeforeAfter | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [baPlay, setBaPlay] = useState(false);
  const [gridPlay, setGridPlay] = useState(false);
  const fractions = metricFractions(results.map((r) => r.metric));

  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced-motion shows finals immediately
      setBaPlay(true);
      setGridPlay(true);
    }
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced) return;
      const ba = ref.current?.querySelector<HTMLElement>("[data-ba]");
      if (ba) {
        ScrollTrigger.create({
          trigger: ba,
          start: "top 82%",
          once: true,
          onEnter: () => setBaPlay(true),
        });
      } else {
        setBaPlay(true);
      }
      const grid = ref.current?.querySelector<HTMLElement>("[data-grid]");
      if (grid) {
        ScrollTrigger.create({
          trigger: grid,
          start: "top 82%",
          once: true,
          onEnter: () => setGridPlay(true),
        });
      }
      const reveals = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        ref.current,
      );
      reveals.forEach((el) =>
        gsap.from(el, {
          y: 22,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        }),
      );
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: ref, dependencies: [reduced] },
  );

  if (results.length === 0 && !beforeAfter) return null;

  return (
    <section
      ref={ref}
      className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
    >
      <h2
        data-reveal
        className="mb-8 font-semibold tracking-tight text-[var(--text)]"
        style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
      >
        The Results
      </h2>

      {beforeAfter ? (
        <div
          data-ba
          className="mb-12 rounded-2xl border border-white/10 bg-[var(--panel)] p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm uppercase tracking-[0.15em] text-[var(--muted)]">
              {beforeAfter.label}
            </span>
            <span
              className="font-semibold tracking-tight text-[var(--accent-amber)]"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
            >
              <MetricNumber raw={beforeAfter.delta} play={baPlay} />
            </span>
          </div>
          <div className="mt-6 space-y-4">
            <BarRow
              label="Before"
              frac={beforeAfter.beforeFrac}
              tone="indigo"
              play={baPlay}
            />
            <BarRow
              label="After"
              frac={beforeAfter.afterFrac}
              tone="amber"
              play={baPlay}
              highlight
            />
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Relative comparison illustrating the{" "}
            {beforeAfter.improvement === "down" ? "reduction" : "increase"}.
          </p>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div
          data-grid
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {results.map((r, i) => {
            const isPct = parseMetric(r.metric)?.isPercent;
            return (
              <div
                key={i}
                className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-[var(--panel)] p-6"
              >
                {isPct ? (
                  <Donut fraction={fractions[i]} play={gridPlay} size={112}>
                    <MetricNumber
                      raw={r.metric}
                      play={gridPlay}
                      className="text-xl font-semibold tracking-tight text-[var(--accent-amber)]"
                    />
                  </Donut>
                ) : (
                  <div className="w-full">
                    <div
                      className="font-semibold tracking-tight text-[var(--accent-amber)]"
                      style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
                    >
                      <MetricNumber raw={r.metric} play={gridPlay} />
                    </div>
                    <div className="mt-3">
                      <MetricBar fraction={fractions[i]} play={gridPlay} />
                    </div>
                  </div>
                )}
                {r.label ? (
                  <div className="text-sm text-[var(--muted)]">{r.label}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function BarRow({
  label,
  frac,
  tone,
  play,
  highlight = false,
}: {
  label: string;
  frac: number;
  tone: "amber" | "indigo";
  play: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs">
        <span className={highlight ? "text-[var(--text)]" : "text-[var(--muted)]"}>
          {label}
        </span>
      </div>
      <MetricBar fraction={frac} play={play} tone={tone} />
    </div>
  );
}
