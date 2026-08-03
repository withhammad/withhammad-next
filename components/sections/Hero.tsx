"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import CountUp from "@/components/ui/CountUp";
import GradientMesh from "@/components/ui/GradientMesh";

// WebGL backdrop — client-only, and never part of the initial bundle so it
// can't delay the headline (the LCP element).
const NeuralField = dynamic(() => import("@/components/three/NeuralField"), {
  ssr: false,
});

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/withhammad-marketing/30min";

const HEADLINE = "I build AI agents that run marketing operations.";
const ACCENT_WORDS = new Set(["agents"]);

type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  group?: boolean;
  label: string;
};

const STATS: Stat[] = [
  { value: 3750, group: true, label: "Conversions driven" },
  { value: 18, prefix: "+", suffix: "%", group: false, label: "ROAS from autonomous agents" },
  { value: 75, prefix: "−", suffix: "%", group: false, label: "Manual optimisation time" },
  { value: 540, suffix: "K", group: false, label: "YouTube subscribers" },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [play, setPlay] = useState(false);

  // Decide when the reveal should start: after the intro loader on first load,
  // immediately on subsequent loads or under reduced-motion.
  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("wh:intro-seen");
    } catch {
      /* sessionStorage unavailable — treat as not seen */
    }
    if (reduced || seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time, SSR-safe reveal cue
      setPlay(true);
      return;
    }
    const onIntroComplete = () => setPlay(true);
    window.addEventListener("wh:intro-complete", onIntroComplete, {
      once: true,
    });
    // Fallback in case the loader never fires (e.g. it was skipped).
    const fallback = window.setTimeout(() => setPlay(true), 2400);
    return () => {
      window.removeEventListener("wh:intro-complete", onIntroComplete);
      window.clearTimeout(fallback);
    };
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced) return; // leave everything visible
      const words = gsap.utils.toArray<HTMLElement>(
        "[data-word-inner]",
        containerRef.current,
      );
      const rises = gsap.utils.toArray<HTMLElement>(
        "[data-rise]",
        containerRef.current,
      );
      gsap.set(words, { yPercent: 118 });
      gsap.set(rises, { y: 26, autoAlpha: 0 });

      if (!play) return; // stay hidden (behind the intro loader) until cued

      const tl = gsap.timeline();
      tl.to(words, {
        yPercent: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.05,
      }).to(
        rises,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
        },
        "-=0.5",
      );
    },
    { scope: containerRef, dependencies: [play, reduced] },
  );

  return (
    <section
      ref={containerRef}
      className="relative -mt-16 flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pb-16 pt-28 sm:px-8"
    >
      <GradientMesh />

      {/* Live 3D neural field, with brand-dark gradients over it so the
          headline + stats stay fully legible at every viewport. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[6] overflow-hidden"
      >
        <NeuralField className="absolute inset-0 opacity-70" density={1} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, var(--bg) 6%, color-mix(in oklab, var(--bg) 62%, transparent) 42%, color-mix(in oklab, var(--bg) 22%, transparent) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 32%, var(--bg) 97%)",
          }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div
            data-rise
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)] backdrop-blur"
            style={{
              backgroundColor: "color-mix(in oklab, var(--panel) 60%, transparent)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]" />
            Dubai, UAE · Open to roles &amp; founder projects
          </div>

          <h1
            className="font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2.3rem, 5vw, 4.4rem)", lineHeight: 1.05 }}
          >
            {HEADLINE.split(" ").map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-baseline"
              >
                <span
                  data-word-inner
                  className={
                    "inline-block will-change-transform " +
                    (ACCENT_WORDS.has(word) ? "text-[var(--accent-2)]" : "")
                  }
                >
                  {word}
                </span>
                {" "}
              </span>
            ))}
          </h1>

          <p
            data-rise
            className="mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg"
          >
            I&apos;m Hammad — an{" "}
            <span className="text-[var(--text)]">
              AI Marketing Automation Engineer
            </span>{" "}
            in Dubai. I design production AI agents and multi-agent systems with
            Claude Code, n8n + MCP and RAG — backed by{" "}
            <span className="text-[var(--text)]">
              6+ years of performance marketing
            </span>{" "}
            across the GCC.
          </p>

          <div data-rise className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-[var(--accent-ink)] shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]"
            >
              Book a Call
            </a>
            <Link
              href="/work#ai-systems"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-[var(--text)] transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Explore the AI systems
            </Link>
          </div>
        </div>

        <div data-rise className="relative mx-auto w-full max-w-sm">
          <Headshot />
        </div>
      </div>

      <div
        data-rise
        className="mx-auto mt-16 grid w-full max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 sm:mt-20 md:grid-cols-4"
        style={{
          backgroundColor: "color-mix(in oklab, white 8%, transparent)",
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            className="px-5 py-6 backdrop-blur"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--panel) 75%, transparent)",
            }}
          >
            <div
              className="font-semibold tracking-tight text-[var(--accent-2)]"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
            >
              <CountUp
                value={s.value}
                play={play}
                prefix={s.prefix}
                suffix={s.suffix}
                group={s.group}
              />
            </div>
            <div className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Headshot() {
  const [errored, setErrored] = useState(false);

  return (
    <>
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, var(--accent), transparent 60%)",
        }}
      />
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)]">
        {!errored ? (
          <Image
            src="/hammad-headshot.jpg"
            alt="Hammad Yousuf, AI marketing growth strategist based in Dubai"
            fill
            sizes="(max-width: 1024px) 80vw, 400px"
            className="object-cover"
            onError={() => setErrored(true)}
            priority
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full border border-white/15 text-2xl font-semibold text-[var(--text)]">
              HY
            </span>
            <span className="px-6 text-xs text-[var(--muted)]">
              Add your photo at{" "}
              <code className="text-[var(--text)]">
                /public/hammad-headshot.jpg
              </code>
            </span>
          </div>
        )}
      </div>
    </>
  );
}
