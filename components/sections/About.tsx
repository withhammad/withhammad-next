"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const CV_URL = "/Hammad-Yousuf-CV.pdf";

// Issuers of genuine certifications. Drop logo images at /public/certs/<slug>.svg
// later; until then the issuer name renders as a clean wordmark chip.
const CERTS = [
  { name: "Google", note: "Ads & Analytics" },
  { name: "Meta", note: "Blueprint" },
  { name: "SEMrush", note: "SEO" },
  { name: "Dubai Future Foundation", note: "Future Skills" },
] as const;

function VerifiedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4 text-[var(--accent-amber)]"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AboutPhoto() {
  const [errored, setErrored] = useState(false);
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, var(--accent-indigo), transparent 62%)",
        }}
      />
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)]">
        {!errored ? (
          <Image
            src="/hammad-about.jpg"
            alt="Hammad Yousuf"
            fill
            sizes="(max-width: 1024px) 80vw, 384px"
            className="object-cover"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full border border-white/15 text-2xl font-semibold text-[var(--text)]">
              HY
            </span>
            <span className="px-6 text-xs text-[var(--muted)]">
              Add your photo at{" "}
              <code className="text-[var(--text)]">/public/hammad-about.jpg</code>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

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
      const certs = gsap.utils.toArray<HTMLElement>("[data-cert]", ref.current);
      gsap.from(certs, {
        y: 20,
        autoAlpha: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: certs[0], start: "top 88%" },
      });
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section ref={ref} id="about" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div data-reveal>
            <AboutPhoto />
          </div>

          <div>
            <span
              data-reveal
              className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-indigo)]" />
              About
            </span>
            <h2
              data-reveal
              className="max-w-xl font-semibold tracking-tight text-[var(--text)]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", lineHeight: 1.05 }}
            >
              I build the engine behind the numbers.
            </h2>
            <p data-reveal className="mt-6 max-w-xl text-[var(--muted)] sm:text-lg">
              I&apos;m Hammad Yousuf — a blended{" "}
              <span className="text-[var(--text)]">
                AI Marketing Growth Strategist
              </span>{" "}
              and{" "}
              <span className="text-[var(--text)]">
                Performance Marketing Specialist
              </span>{" "}
              based in Dubai. I&apos;ve managed significant ad budgets across the
              GCC and beyond, restructuring messy, money-losing accounts into
              predictable, revenue-focused growth engines for founders and
              scaling brands.
            </p>
            <p data-reveal className="mt-4 max-w-xl text-[var(--muted)]">
              I don&apos;t just run campaigns — I build the tracking, the creative
              systems, and the automation behind them, and I bring an audience
              builder&apos;s instinct to every account. Alongside client work I
              grew a 540K-subscriber YouTube channel from zero, which keeps me
              close to exactly what makes people click, watch, and convert.
            </p>

            <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={CV_URL}
                download
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent-indigo)] px-6 text-sm font-medium text-white shadow-[0_12px_32px_-12px_rgba(99,102,241,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#7C7DF3]"
              >
                Download CV
              </a>
              <Link
                href="/#services"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-[var(--text)] transition-colors hover:border-white/40 hover:bg-white/5"
              >
                How I work
              </Link>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-16 sm:mt-20">
          <div
            data-reveal
            className="mb-6 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            Certifications &amp; credentials
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CERTS.map((c) => (
              <div
                key={c.name}
                data-cert
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-[var(--panel)] px-4 py-4 transition-colors hover:border-white/25"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10">
                  <VerifiedIcon />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[var(--text)]">
                    {c.name}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">
                    {c.note} · Certified
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
