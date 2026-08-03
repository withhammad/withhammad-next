"use client";

// Featured missions: vertical scroll drives horizontal travel through large
// panels (GSAP pin + x-translate). Under 768px — or with reduced motion —
// it degrades to a plain vertical stack; the pin never runs there.

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { PROJECTS, STATUS_LABEL } from "@/lib/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const FEATURED_SLUGS = ["jarvis", "ibrahim", "adam", "google-ads-agent"];

export default function HorizontalShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const featured = PROJECTS.filter((p) => FEATURED_SLUGS.includes(p.slug));

  useGSAP(
    () => {
      if (reduced) return;
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <div ref={rootRef} className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex flex-col gap-6 px-5 py-16 sm:px-8 md:h-svh md:w-max md:flex-row md:items-center md:gap-8 md:py-0 md:pr-[20vw]"
      >
        {featured.map((p, i) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            data-cursor="OPEN"
            className="group relative flex min-h-[320px] flex-col justify-between border border-[var(--line)] bg-[var(--panel)]/60 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-[var(--accent)]/60 sm:p-9 md:h-[64vh] md:w-[68vw] lg:w-[54vw]"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-[11px] tracking-[0.3em] text-[var(--accent)]/70">
                {String(i + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")} — {p.codename}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--accent-2)]">
                {STATUS_LABEL[p.status]}
              </span>
            </div>

            <div>
              <h3
                className="font-display font-semibold uppercase leading-none text-[var(--text)] transition-colors duration-300 group-hover:text-[var(--accent)]"
                style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
              >
                {p.name}
              </h3>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {p.oneLiner}
              </p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              {p.pullStats[0] ? (
                <div>
                  <div className="text-3xl font-semibold text-[var(--accent)]">
                    {p.pullStats[0].value}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    {p.pullStats[0].label}
                  </div>
                </div>
              ) : (
                <span />
              )}
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
                OPEN MISSION →
              </span>
            </div>

            <span
              aria-hidden
              className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 group-hover:scale-x-100"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
