"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { parseMetric } from "@/lib/metrics";
import CountUp from "@/components/ui/CountUp";

/** Count-up of a freeform metric string ("3,750", "AED 76", "−28%", "3.8x"). */
export function MetricNumber({
  raw,
  play,
  className,
}: {
  raw: string;
  play: boolean;
  className?: string;
}) {
  const p = parseMetric(raw);
  if (!p) return <span className={className}>{raw}</span>;
  return (
    <CountUp
      className={className}
      value={p.value}
      play={play}
      prefix={p.prefix}
      suffix={p.suffix}
      decimals={p.decimals}
      group={p.group}
    />
  );
}

/** Horizontal bar that fills via GPU-only transform: scaleX. */
export function MetricBar({
  fraction,
  play,
  tone = "amber",
}: {
  fraction: number;
  play: boolean;
  tone?: "amber" | "indigo";
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const frac = Math.min(1, Math.max(0, fraction));

  useGSAP(
    () => {
      const el = fillRef.current;
      if (!el) return;
      gsap.set(el, {
        scaleX: reduced ? frac : 0,
        transformOrigin: "left center",
      });
      if (!reduced && play) {
        gsap.to(el, { scaleX: frac, duration: 1, ease: "power3.out" });
      }
    },
    { dependencies: [play, reduced, frac] },
  );

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        ref={fillRef}
        className="h-full w-full rounded-full will-change-transform"
        style={{
          background:
            // The two tones must stay tellable apart. Before the theme switch
            // they were amber vs indigo; with an all-amber palette the second
            // tone reaches for --accent-cool instead of a second amber.
            tone === "amber"
              ? "linear-gradient(90deg, var(--accent-2), var(--accent))"
              : "linear-gradient(90deg, var(--accent-cool), color-mix(in oklab, var(--accent-cool) 60%, var(--accent)))",
        }}
      />
    </div>
  );
}

/** Donut ring whose arc draws to `fraction`; renders children centered. */
export function Donut({
  fraction,
  play,
  size = 104,
  stroke = 9,
  children,
}: {
  fraction: number;
  play: boolean;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const arcRef = useRef<SVGCircleElement>(null);
  const reduced = useReducedMotion();
  const frac = Math.min(1, Math.max(0, fraction));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  useGSAP(
    () => {
      const el = arcRef.current;
      if (!el) return;
      const target = circumference * (1 - frac);
      gsap.set(el, {
        strokeDasharray: circumference,
        strokeDashoffset: reduced ? target : circumference,
      });
      if (!reduced && play) {
        gsap.to(el, {
          strokeDashoffset: target,
          duration: 1.2,
          ease: "power3.out",
        });
      }
    },
    { dependencies: [play, reduced, frac] },
  );

  return (
    <div
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <circle
          ref={arcRef}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent-2)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        {children}
      </div>
    </div>
  );
}
