"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LINKEDIN_HANDLE, LINKEDIN_URL } from "@/lib/person";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  "https://calendly.com/withhammad-marketing/30min";

const EMAIL = "marketing@withhammad.com";

const SOCIALS = [
  {
    label: "YouTube",
    handle: "@with.hammad",
    href: "https://www.youtube.com/@with.hammad",
  },
  {
    label: "LinkedIn",
    handle: LINKEDIN_HANDLE,
    href: LINKEDIN_URL,
  },
] as const;

// Dark-themed inline embed URL — Calendly applies these colors client-side.
const SEP = CALENDLY_URL.includes("?") ? "&" : "?";
const EMBED_URL =
  CALENDLY_URL +
  SEP +
  "hide_gdpr_banner=1&background_color=1a1a1d&text_color=f5f5f7&primary_color=ff8c00";

const CALENDLY_CSS = "https://assets.calendly.com/assets/external/widget.css";
const CALENDLY_JS = "https://assets.calendly.com/assets/external/widget.js";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  // Lazy-load the Calendly embed only when the section nears the viewport,
  // so its third-party script never blocks initial page load.
  useEffect(() => {
    const section = ref.current;
    if (!section || !widgetRef.current) return;

    let cancelled = false;
    let revealTimer: number | undefined;

    const reveal = () => {
      if (!cancelled) setReady(true);
    };

    const init = () => {
      const parent = widgetRef.current;
      if (cancelled || !window.Calendly || !parent) return;
      if (parent.dataset.inited) return;
      parent.dataset.inited = "1";
      window.Calendly.initInlineWidget({ url: EMBED_URL, parentElement: parent });
      // Reveal once the embedded scheduler loads (with a safety fallback).
      const iframe = parent.querySelector("iframe");
      if (iframe) iframe.addEventListener("load", reveal);
      revealTimer = window.setTimeout(reveal, 5000);
    };

    const load = () => {
      if (cancelled) return;
      if (!document.querySelector('link[data-calendly="1"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = CALENDLY_CSS;
        link.dataset.calendly = "1";
        document.head.appendChild(link);
      }
      if (window.Calendly) {
        init();
        return;
      }
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-calendly="1"]',
      );
      if (existing) {
        existing.addEventListener("load", init);
        return;
      }
      const script = document.createElement("script");
      script.src = CALENDLY_JS;
      script.async = true;
      script.dataset.calendly = "1";
      script.addEventListener("load", init);
      document.body.appendChild(script);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(section);

    return () => {
      cancelled = true;
      io.disconnect();
      if (revealTimer) clearTimeout(revealTimer);
    };
  }, []);

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
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section
      ref={ref}
      id="contact"
      data-hud-section="05 / EXTRACTION"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span
            data-reveal
            className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Let&apos;s talk
          </span>
          <h2
            data-reveal
            className="font-semibold tracking-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", lineHeight: 1.04 }}
          >
            Let&apos;s build your growth engine.
          </h2>
          <p
            data-reveal
            className="mx-auto mt-5 max-w-xl text-[var(--muted)] sm:text-lg"
          >
            Book a free 30-minute call. We&apos;ll pressure-test your funnel,
            find where the money leaks, and map the fastest path to predictable
            revenue — no pitch, just a plan.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* Contact block */}
          <div data-reveal className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-white/10 bg-[var(--panel)] p-8">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Prefer to reach out directly?
              </h3>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-4 block text-2xl font-semibold tracking-tight text-[var(--text)] transition-colors hover:text-[var(--accent-2)] sm:text-3xl"
              >
                {EMAIL}
              </a>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Based in Dubai, UAE — working with founders and teams worldwide.
              </p>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Find me on
                </div>
                <ul className="space-y-3">
                  {SOCIALS.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-[var(--text)] transition-colors hover:text-[var(--accent-2)]"
                      >
                        <span className="text-sm font-medium">{s.label}</span>
                        <span className="text-sm text-[var(--muted)] transition-colors group-hover:text-[var(--accent-2)]">
                          {s.handle}
                        </span>
                        <span
                          aria-hidden
                          className="text-[var(--muted)] transition-colors group-hover:text-[var(--accent-2)]"
                        >
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Calendly inline embed */}
          <div data-reveal>
            <div className="relative h-[1040px] overflow-hidden rounded-3xl border border-white/10 bg-[var(--panel)] sm:h-[720px]">
              <div ref={widgetRef} className="h-full w-full" style={{ minWidth: 320 }} />
              {!ready ? (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
                    <span
                      className={
                        "h-8 w-8 rounded-full border-2 border-white/15 border-t-[var(--accent)] " +
                        (reduced ? "" : "animate-spin")
                      }
                    />
                    <span className="text-sm">Loading scheduler…</span>
                  </div>
                </div>
              ) : null}
            </div>
            <p className="mt-3 text-center text-sm text-[var(--muted)]">
              Trouble loading?{" "}
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Open the scheduler in a new tab ↗
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
