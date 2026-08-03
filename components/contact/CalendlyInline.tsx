"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  "https://calendly.com/withhammad-marketing/30min";

const SEP = CALENDLY_URL.includes("?") ? "&" : "?";
const EMBED_URL =
  CALENDLY_URL +
  SEP +
  "hide_gdpr_banner=1&background_color=1a1a1d&text_color=f5f5f7&primary_color=ff8c00";

const CALENDLY_CSS = "https://assets.calendly.com/assets/external/widget.css";
const CALENDLY_JS = "https://assets.calendly.com/assets/external/widget.js";

/**
 * Lazy-loaded Calendly inline scheduler. The third-party script only loads when
 * the widget nears the viewport, so it never blocks initial page load.
 */
export default function CalendlyInline({
  className = "",
}: {
  className?: string;
}) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const parent = widgetRef.current;
    if (!parent) return;

    let cancelled = false;
    let revealTimer: number | undefined;

    const reveal = () => {
      if (!cancelled) setReady(true);
    };

    const init = () => {
      if (cancelled || !window.Calendly || !parent) return;
      if (parent.dataset.inited) return;
      parent.dataset.inited = "1";
      window.Calendly.initInlineWidget({ url: EMBED_URL, parentElement: parent });
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
      if (window.Calendly) return init();
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
    io.observe(parent);

    return () => {
      cancelled = true;
      io.disconnect();
      if (revealTimer) clearTimeout(revealTimer);
    };
  }, []);

  return (
    <div className={className}>
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
      {/* No-JS / crawler fallback: a real, crawlable booking link. */}
      <noscript>
        <p className="mt-3 text-center text-sm text-[var(--muted)]">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Book a free 30-minute call with Hammad Yousuf ↗
          </a>
        </p>
      </noscript>
    </div>
  );
}
