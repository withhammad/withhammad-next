"use client";

// JARVIS flagship scroll-story: a pinned section scrubbed through 4 acts
// (SEO engine → voice layer → Hermes orchestrator → sub-agent squad).
// Holographic panels re-arrange per act; the low-density neural field drifts
// behind. GSAP ScrollTrigger scrub — works in both directions by construction.
//
// Reduced motion: no pin, no scrub — the four acts render as a plain stacked
// list, fully readable.

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { JARVIS_ACTS } from "@/lib/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const NeuralField = dynamic(() => import("@/components/three/NeuralField"), {
  ssr: false,
});

export default function JarvisStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const root = rootRef.current;
      if (!root) return;

      const acts = gsap.utils.toArray<HTMLElement>("[data-act]", root);
      const panels = gsap.utils.toArray<HTMLElement>("[data-holo]", root);

      // Everything but act 0 starts hidden.
      acts.forEach((a, i) => {
        if (i > 0) gsap.set(a, { autoAlpha: 0, y: 60 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=300%", // 4 acts ≈ 3 viewport-heights of scrub
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      acts.forEach((act, i) => {
        if (i === 0) return;
        tl.to(acts[i - 1], { autoAlpha: 0, y: -60, duration: 0.35 }, `act${i}`)
          .fromTo(
            act,
            { autoAlpha: 0, y: 60 },
            { autoAlpha: 1, y: 0, duration: 0.45 },
            `act${i}+=0.15`,
          )
          // holo panels re-arrange each act: rotate/drift to a new formation
          .to(
            panels,
            {
              rotation: (j) => (i + j) * 12 - 18,
              x: (j) => Math.sin(i * 1.7 + j) * 90,
              y: (j) => Math.cos(i * 1.3 + j) * 60,
              duration: 0.5,
            },
            `act${i}`,
          );
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  if (reduced) {
    return (
      <section className="mx-auto max-w-4xl space-y-12 px-5 py-20 sm:px-8">
        {JARVIS_ACTS.map((act) => (
          <div key={act.no} className="border-l border-[var(--accent)]/40 pl-6">
            <div className="font-mono text-[11px] tracking-[0.3em] text-[var(--accent)]">
              ACT {act.no}
            </div>
            <h3 className="font-display mt-2 text-3xl font-semibold uppercase text-[var(--text)]">
              {act.title}
            </h3>
            <p className="mt-3 max-w-xl text-[var(--muted)]">{act.body}</p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <div ref={rootRef} className="relative h-svh overflow-hidden">
      {/* world backdrop, low density, non-interactive */}
      <NeuralField
        className="absolute inset-0 opacity-40"
        density={0.45}
        interactive={false}
      />

      {/* holographic panels that re-arrange per act */}
      <div aria-hidden className="absolute inset-0">
        {[0, 1, 2].map((j) => (
          <div
            key={j}
            data-holo
            className="scanlines absolute border border-[var(--accent)]/25 bg-[var(--accent)]/[0.03] backdrop-blur-[2px]"
            style={{
              width: 180 + j * 60,
              height: 110 + j * 40,
              left: `${18 + j * 26}%`,
              top: `${22 + j * 18}%`,
            }}
          />
        ))}
      </div>

      {/* acts — absolutely stacked, cross-faded by the scrub timeline */}
      <div className="relative flex h-full items-center">
        <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
          {JARVIS_ACTS.map((act, i) => (
            <div
              key={act.no}
              data-act
              className={i === 0 ? "" : "absolute inset-x-5 top-1/2 -translate-y-1/2 sm:inset-x-8"}
            >
              <div className="font-mono text-[11px] tracking-[0.35em] text-[var(--accent)]">
                ACT {act.no} / 04
              </div>
              <h3
                className="font-display mt-3 font-semibold uppercase leading-none text-[var(--text)]"
                style={{ fontSize: "clamp(2.4rem, 7vw, 6rem)" }}
              >
                {act.title}
              </h3>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                {act.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* scrub hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]/60">
        SCROLL TO ADVANCE
      </div>
    </div>
  );
}
