"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT } from "@/lib/easing";

const STORAGE_KEY = "wh:intro-seen";

export default function IntroLoader() {
  const [show, setShow] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // `reduced` is false on the hydration pass (useSyncExternalStore returns the
    // server snapshot) and only flips true on the following render. Without
    // clearing `show` here, that first pass opens the overlay, this re-run
    // cancels its dismiss timer, and the full-screen intro stays up forever —
    // locking reduced-motion users out of the whole site.
    if (reduced) {
      setShow(false);
      return;
    }
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // sessionStorage may be unavailable (private mode, etc.) — just show once.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time first-load intro
    setShow(true);
    const t = window.setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* noop */
      }
      // Signal the hero (and any other first-load animations) to begin.
      window.dispatchEvent(new Event("wh:intro-complete"));
    }, 1600);
    return () => window.clearTimeout(t);
  }, [reduced]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-[var(--bg)]"
          aria-hidden
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { duration: 0.6, ease: EASE_OUT },
            }}
            exit={{
              y: -10,
              opacity: 0,
              transition: { duration: 0.35, ease: "easeIn" },
            }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
              With Hammad
            </span>
            <span
              className="font-semibold tracking-tight text-[var(--text)]"
              style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}
            >
              Hammad Yousuf
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: 1,
                transition: { duration: 1, ease: EASE_OUT },
              }}
              className="mt-1 h-px w-32 origin-left bg-[var(--accent-amber)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
