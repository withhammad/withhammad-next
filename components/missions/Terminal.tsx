"use client";

// Reusable sci-fi console: mono, scanlines, blinking caret, output that types
// on scroll-into-view. Sells "autonomous agent" better than any diagram —
// these are realistic session logs, not decoration.
//
// Reduced motion (or JS-off... the log is real DOM either way): the full log
// renders instantly, no typing.

import { useEffect, useRef, useState } from "react";
import type { TerminalLine } from "@/lib/projects";
import CaseLinks from "@/components/hud/CaseLinks";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const KIND_CLASS: Record<TerminalLine["kind"], string> = {
  cmd: "text-[var(--text)]",
  out: "text-[var(--muted)]",
  ok: "text-emerald-400/90",
  warn: "text-[var(--accent)]",
  sys: "text-[var(--accent-cool)]/80",
};

const KIND_PREFIX: Record<TerminalLine["kind"], string> = {
  cmd: "$ ",
  out: "  ",
  ok: "✓ ",
  warn: "! ",
  sys: "▸ ",
};

export default function Terminal({
  title,
  lines,
  linkKey,
  hideWriteup = false,
}: {
  title: string;
  lines: TerminalLine[];
  linkKey?: string;
  hideWriteup?: boolean;
}) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(0);
  const [armed, setArmed] = useState(false);

  // Start typing when the console scrolls into view.
  useEffect(() => {
    if (reduced) {
      setVisible(lines.length);
      return;
    }
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "-15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, lines.length]);

  useEffect(() => {
    if (!armed || reduced) return;
    if (visible >= lines.length) return;
    const line = lines[visible];
    // commands land slower than output — reads like a real session
    const delay = line.kind === "cmd" ? 520 : line.kind === "sys" ? 380 : 210;
    const t = window.setTimeout(() => setVisible((v) => v + 1), delay);
    return () => window.clearTimeout(t);
  }, [armed, visible, lines, reduced]);

  return (
    <div
      ref={wrapRef}
      className="scanlines relative overflow-hidden border border-[var(--line)] bg-[var(--bg-deep)]"
    >
      {/* title bar */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
          {title}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]/35" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]/20" />
        </span>
      </div>

      <div className="min-h-[16rem] px-4 py-4 font-mono text-[12px] leading-6 sm:text-[13px]">
        {lines.slice(0, visible).map((l, i) => (
          <div key={i} className={KIND_CLASS[l.kind]}>
            <span className="select-none opacity-60">{KIND_PREFIX[l.kind]}</span>
            {l.text}
          </div>
        ))}
        {visible < lines.length && (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-[1.1em] w-[7px] translate-y-[3px] animate-pulse bg-[var(--accent)]"
          />
        )}
      </div>

      {linkKey ? (
        <div className="border-t border-[var(--line)] px-4 py-3">
          <CaseLinks linkKey={linkKey} hideWriteup={hideWriteup} />
        </div>
      ) : null}
    </div>
  );
}
