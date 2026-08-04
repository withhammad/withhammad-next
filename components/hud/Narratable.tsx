"use client";

// Wraps a section so clicking it asks JARVIS for a briefing. The section stays
// entirely normal content — this only adds an amber outline while its clip is
// playing and a "▶ LISTEN" cursor label.
//
// Accessibility: the trigger is a real <button> in the corner rather than a
// click handler on the whole block, so keyboard users get one focusable
// control and text inside the section stays selectable.

import { useNarrator } from "@/components/providers/NarratorProvider";

export default function Narratable({
  id,
  children,
  className = "",
}: {
  /** Must match a key in lib/narration-scripts.ts */
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { active, muted, play } = useNarrator();
  const isActive = active === id;

  return (
    <div
      data-narratable={id}
      data-cursor={muted ? undefined : "▶ LISTEN"}
      className={`relative transition-shadow duration-500 ${
        isActive ? "shadow-[inset_0_0_0_1px_var(--accent)]" : ""
      } ${className}`}
    >
      {children}

      <button
        type="button"
        onClick={() => play(id)}
        aria-label={
          isActive ? "Stop JARVIS briefing" : "Play JARVIS briefing for this section"
        }
        className="print-hide absolute right-4 top-4 z-10 hidden items-center gap-2 border border-[var(--line)] bg-[var(--bg-deep)]/70 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] backdrop-blur transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] md:inline-flex"
      >
        {isActive ? (
          <>
            <EqualiserBars />
            BRIEFING
          </>
        ) : (
          <>▶ LISTEN</>
        )}
      </button>
    </div>
  );
}

/** Three amber bars that bounce while a clip plays. */
export function EqualiserBars({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-flex items-end gap-[2px] ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[2px] bg-[var(--accent)]"
          style={{
            height: 8,
            animation: `wh-eq 700ms ease-in-out ${i * 140}ms infinite alternate`,
          }}
        />
      ))}
    </span>
  );
}
