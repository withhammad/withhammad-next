"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MetricNumber } from "@/components/ui/charts";

const YT_URL = "https://www.youtube.com/@with.hammad";

function SilverPlayButton() {
  return (
    <svg
      viewBox="0 0 72 72"
      width="64"
      height="64"
      aria-hidden
      className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
    >
      <defs>
        <linearGradient id="wh-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f2f2f5" />
          <stop offset="45%" stopColor="#b9b9c2" />
          <stop offset="70%" stopColor="#8f8f99" />
          <stop offset="100%" stopColor="#dadae0" />
        </linearGradient>
      </defs>
      <rect x="6" y="16" width="60" height="42" rx="11" fill="url(#wh-silver)" />
      <rect
        x="6"
        y="16"
        width="60"
        height="42"
        rx="11"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.75"
      />
      <path d="M30 28 L46 37 L30 46 Z" fill="#141417" />
    </svg>
  );
}

export default function YouTubeCredibility() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced-motion shows the count immediately
      setPlay(true);
    }
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced) return;
      const reveals = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        ref.current,
      );
      reveals.forEach((el) =>
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }),
      );
      const visual = ref.current?.querySelector<HTMLElement>("[data-yt]");
      if (visual) {
        ScrollTrigger.create({
          trigger: visual,
          start: "top 80%",
          once: true,
          onEnter: () => setPlay(true),
        });
      }
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section
      ref={ref}
      id="youtube"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
        {/* Copy */}
        <div>
          <span
            data-reveal
            className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Distribution as a skill
          </span>
          <h2
            data-reveal
            className="max-w-xl font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)", lineHeight: 1.08 }}
          >
            I don&apos;t just run ads —{" "}
            <span className="text-[var(--accent-2)]">
              I built a 540K audience from scratch.
            </span>
          </h2>
          <p
            data-reveal
            className="mt-5 max-w-xl text-[var(--muted)] sm:text-lg"
          >
            Growing a YouTube channel from zero to 540,000 subscribers is the
            same muscle as performance marketing: nail the hook, earn the
            retention, and understand exactly what makes someone click and stay.
            I&apos;ve proven it on my own channel — and I bring that audience
            instinct to every campaign I run.
          </p>
          <div data-reveal className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={YT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-medium text-[var(--text)] transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Watch on YouTube
              <span aria-hidden>↗</span>
            </a>
            <span className="text-sm text-[var(--muted)]">@with.hammad</span>
          </div>
        </div>

        {/* Visual */}
        <div data-yt className="relative mx-auto w-full max-w-md">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 -z-10 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 50% 35%, color-mix(in oklab, var(--accent-2) 55%, transparent), transparent 65%)",
            }}
          />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)] p-8 text-center sm:p-10">
            <div className="mx-auto mb-6 w-fit">
              <SilverPlayButton />
            </div>
            <div
              className="font-semibold leading-none tracking-tight text-[var(--accent-2)]"
              style={{ fontSize: "clamp(3rem, 8vw, 5rem)" }}
            >
              <MetricNumber raw="540K" play={play} />
            </div>
            <div className="mt-2 text-[var(--muted)]">Subscribers</div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-[var(--muted)]">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #f2f2f5, #9a9aa4)",
                }}
              />
              Silver Play Button · 100K+ milestone
            </div>
            <div className="mt-4 text-sm text-[var(--text)]">@with.hammad</div>
          </div>
        </div>
      </div>
    </section>
  );
}
