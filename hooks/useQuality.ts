"use client";

// Adaptive quality: pick a starting tier from device signals, then correct it
// from measured frame times. This is drei's <PerformanceMonitor> in ~60 lines,
// without the dependency.
//
// Rules that matter:
//   - Downgrade fast (jank is felt immediately), upgrade slowly and only once
//     (oscillating between tiers looks worse than sitting one tier low).
//   - prefers-reduced-motion pins tier 0: no post, minimum particles, and the
//     scenes freeze their own motion.
//   - Measurement only runs while the canvas is on screen.

import { useEffect, useRef, useState } from "react";
import { QUALITY, detectTier, type QualitySettings } from "@/lib/gpu-tier";

const SAMPLE_MS = 1000;
const BAD_FPS = 32; // below this we shed quality
const GOOD_FPS = 56; // sustained above this we may reclaim one tier

export function useQuality(active = true): QualitySettings & {
  /** call once per rendered frame from inside useFrame */
  reportFrame: () => void;
} {
  const [tier, setTier] = useState<QualitySettings["tier"]>(2);
  const [reduced, setReduced] = useState(false);
  const frames = useRef(0);
  const windowStart = useRef(0);
  const upgradesLeft = useRef(1);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) return;
    setTier(detectTier());
  }, [reduced]);

  const reportFrame = () => {
    if (!active || reduced) return;
    const now = performance.now();
    if (windowStart.current === 0) {
      windowStart.current = now;
      frames.current = 0;
      return;
    }
    frames.current += 1;
    const elapsed = now - windowStart.current;
    if (elapsed < SAMPLE_MS) return;

    const fps = (frames.current * 1000) / elapsed;
    frames.current = 0;
    windowStart.current = now;

    setTier((t) => {
      if (fps < BAD_FPS && t > 0) {
        upgradesLeft.current = 0; // never climb back after shedding
        return (t - 1) as QualitySettings["tier"];
      }
      if (fps > GOOD_FPS && t < 3 && upgradesLeft.current > 0) {
        upgradesLeft.current -= 1;
        return (t + 1) as QualitySettings["tier"];
      }
      return t;
    });
  };

  const q = reduced ? QUALITY[0] : QUALITY[tier];
  return { ...q, reportFrame };
}
