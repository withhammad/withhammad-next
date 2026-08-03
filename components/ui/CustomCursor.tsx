"use client";

// Game-UI cursor: crisp dot + spring-lagged amber ring + contextual label.
// Any element can set `data-cursor="OPEN"` (or "▶ LISTEN", "DRAG"…) and the
// label appears beside the ring while hovered. Interactive elements without a
// label still scale the ring. Fine pointers only; disabled under
// prefers-reduced-motion and on touch.

import { useEffect, useRef, useState } from "react";

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, [data-cursor], [data-cursor-hover]";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setEnabled(fine.matches && !reduced.matches);
    evaluate();
    fine.addEventListener("change", evaluate);
    reduced.addEventListener("change", evaluate);
    return () => {
      fine.removeEventListener("change", evaluate);
      reduced.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const prev = document.body.style.cursor;
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = prev;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const el = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE) as
        | HTMLElement
        | null;
      const text = el?.dataset.cursor ?? "";
      targetScale = el ? 1.8 : 1;
      ring.style.borderColor = el
        ? "var(--accent)"
        : "rgba(255,255,255,0.35)";
      if (label.textContent !== text) label.textContent = text;
      label.style.opacity = text ? "1" : "0";
    };

    const tick = () => {
      // spring-ish lerp: ring lags the dot, label rides the ring
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      scale += (targetScale - scale) * 0.2;
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0) scale(${scale})`;
      label.style.transform = `translate3d(${rx + 26}px, ${ry - 7}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9979]">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]"
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-9 w-9 rounded-full border border-white/35"
        style={{ boxShadow: "0 0 14px var(--accent-glow)" }}
      />
      <div
        ref={labelRef}
        className="absolute left-0 top-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] opacity-0 transition-opacity duration-150"
      />
    </div>
  );
}
