"use client";

// JARVIS OS boot sequence — the site "powers on" like a machine, not a page.
// Mono terminal lines type in, an amber hairline tracks progress, then the
// whole overlay exits with a clip-path wipe.
//
// Contracts preserved from the previous loader (both load-bearing):
//   - sessionStorage "wh:intro-seen" → boots once per session only.
//   - dispatches "wh:intro-complete" so the hero starts its reveal.
//   - prefers-reduced-motion: never shows. `reduced` is false during the
//     hydration pass and flips true one render later — without the explicit
//     setShow(false) the overlay would mount, lose its dismiss timer to the
//     effect cleanup, and lock reduced-motion users out of the entire site
//     (this happened in production once; do not regress it).

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE } from "@/lib/motion";

const STORAGE_KEY = "wh:intro-seen";

const BOOT_LINES = [
  "JARVIS OS — SYSTEM CHECK",
  "NEURAL FIELD ............. ONLINE",
  "AGENTS ................... 8/8 READY",
  "LOCATION ................. DUBAI, UAE",
  "SYSTEMS ONLINE",
];

const LINE_INTERVAL = 340; // ms between lines
const HOLD_AFTER = 500; // ms after last line before wipe

export default function IntroLoader() {
  const [show, setShow] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const reduced = useReducedMotion();
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced) {
      setShow(false);
      return;
    }
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* private mode etc. — just boot once */
    }
    setShow(true);

    const timers: number[] = [];
    BOOT_LINES.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setLineCount(i + 1), (i + 1) * LINE_INTERVAL),
      );
    });
    timers.push(
      window.setTimeout(
        () => {
          setShow(false);
          try {
            sessionStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* noop */
          }
          window.dispatchEvent(new Event("wh:intro-complete"));
        },
        BOOT_LINES.length * LINE_INTERVAL + HOLD_AFTER,
      ),
    );
    timersRef.current = timers;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced]);

  const progress = show ? lineCount / BOOT_LINES.length : 1;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="boot"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{
            clipPath: "inset(0% 0% 100% 0%)",
            transition: { duration: 0.7, ease: EASE },
          }}
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-[var(--bg-deep)]"
          aria-hidden
        >
          {/* corner ticks — the HUD frame is present from the first frame */}
          <div className="pointer-events-none absolute inset-6 border border-[var(--line)]" />
          <div className="pointer-events-none absolute left-6 top-6 h-3 w-3 border-l-2 border-t-2 border-[var(--accent)]" />
          <div className="pointer-events-none absolute right-6 top-6 h-3 w-3 border-r-2 border-t-2 border-[var(--accent)]" />
          <div className="pointer-events-none absolute bottom-6 left-6 h-3 w-3 border-b-2 border-l-2 border-[var(--accent)]" />
          <div className="pointer-events-none absolute bottom-6 right-6 h-3 w-3 border-b-2 border-r-2 border-[var(--accent)]" />

          <div className="w-[min(88vw,480px)] font-mono text-[13px] leading-7 tracking-wide">
            <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              <span>With Hammad</span>
              <span className="text-[var(--accent)]">
                {Math.round(progress * 100)}%
              </span>
            </div>

            {/* amber hairline progress */}
            <div className="mb-6 h-px w-full bg-white/10">
              <motion.div
                className="h-px bg-[var(--accent)]"
                animate={{ scaleX: progress }}
                initial={{ scaleX: 0 }}
                style={{ transformOrigin: "left" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            <div className="min-h-[10.5rem] text-[var(--muted)]">
              {BOOT_LINES.slice(0, lineCount).map((line, i) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  className={
                    i === BOOT_LINES.length - 1
                      ? "text-[var(--accent)]"
                      : undefined
                  }
                >
                  <span className="mr-2 text-[var(--accent)]/60">&gt;</span>
                  {line}
                  {i === lineCount - 1 && (
                    <motion.span
                      aria-hidden
                      className="ml-1 inline-block h-[1em] w-[7px] translate-y-[2px] bg-[var(--accent)]"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
