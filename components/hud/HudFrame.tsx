"use client";

// Persistent HUD frame — corner ticks + mono telemetry readout. This is what
// makes the whole experience read as one continuous machine rather than pages:
// it never unmounts, whatever route you're on.
//
// Telemetry: scroll progress %, current section (from [data-hud-section]
// attributes observed on scroll), and UAE local time. All DOM writes go
// through refs inside rAF — zero React re-renders on scroll.

import { useEffect, useRef } from "react";

export default function HudFrame() {
  const progressRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current)
        progressRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;

      // nearest section marker above the viewport midline
      const markers = document.querySelectorAll<HTMLElement>("[data-hud-section]");
      let label = "INIT";
      const mid = window.innerHeight * 0.5;
      markers.forEach((m) => {
        if (m.getBoundingClientRect().top <= mid) label = m.dataset.hudSection ?? label;
      });
      if (sectionRef.current && sectionRef.current.textContent !== label)
        sectionRef.current.textContent = label;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const clock = window.setInterval(() => {
      if (clockRef.current)
        clockRef.current.textContent = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Dubai",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date());
    }, 1000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      window.clearInterval(clock);
    };
  }, []);

  return (
    <div aria-hidden className="print-hide pointer-events-none fixed inset-0 z-[70] hidden md:block">
      {/* corner ticks */}
      <div className="absolute left-4 top-4 h-3 w-3 border-l border-t border-[var(--accent)]/50" />
      <div className="absolute right-4 top-4 h-3 w-3 border-r border-t border-[var(--accent)]/50" />
      <div className="absolute bottom-4 left-4 h-3 w-3 border-b border-l border-[var(--accent)]/50" />
      <div className="absolute bottom-4 right-4 h-3 w-3 border-b border-r border-[var(--accent)]/50" />

      {/* right rail: progress bar + telemetry */}
      <div className="absolute bottom-20 right-4 top-24 w-px bg-white/8">
        <div
          ref={barRef}
          className="h-full w-px origin-top bg-[var(--accent)]"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
      <div className="absolute right-8 top-24 flex flex-col items-end gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]/80">
        <span>
          SCROLL <span ref={progressRef} className="text-[var(--accent)]">000</span>
        </span>
        <span ref={sectionRef} className="text-[var(--text)]/70">INIT</span>
      </div>
      <div className="absolute bottom-6 right-8 font-mono text-[10px] tracking-[0.25em] text-[var(--muted)]/70">
        DXB <span ref={clockRef} className="text-[var(--accent)]/80" />
      </div>
      <div className="absolute bottom-6 left-8 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]/70">
        SYSTEMS ONLINE
        <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)] align-middle" />
      </div>
    </div>
  );
}
