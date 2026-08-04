"use client";

// Voice HUD: waveform indicator while JARVIS speaks, a persistent mute toggle,
// and the one-time hint that teaches the click-to-narrate interaction.
// Sits above the chat orb, bottom-right.

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useNarrator } from "@/components/providers/NarratorProvider";
import { EqualiserBars } from "@/components/hud/Narratable";
import { EASE } from "@/lib/motion";

export default function VoiceHud() {
  const { active, muted, toggleMute, stop, hintSeen, dismissHint } = useNarrator();

  // Auto-dismiss the hint after a while so it never nags.
  useEffect(() => {
    if (hintSeen) return;
    const t = window.setTimeout(dismissHint, 12000);
    return () => window.clearTimeout(t);
  }, [hintSeen, dismissHint]);

  return (
    <div className="print-hide fixed bottom-24 right-6 z-[75] flex flex-col items-end gap-2">
      <AnimatePresence>
        {!hintSeen && (
          <motion.button
            key="hint"
            type="button"
            onClick={dismissHint}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="max-w-[15rem] border border-[var(--accent)]/40 bg-[var(--bg-deep)]/90 px-3 py-2 text-left font-mono text-[10px] leading-relaxed tracking-wide text-[var(--muted)] backdrop-blur"
          >
            <span className="text-[var(--accent)]">▶</span> Click any section —
            JARVIS will brief you.
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <motion.button
            key="playing"
            type="button"
            onClick={stop}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.35, ease: EASE }}
            aria-label="Stop narration"
            className="flex items-center gap-2 border border-[var(--accent)]/50 bg-[var(--bg-deep)]/90 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--accent)] backdrop-blur"
          >
            <EqualiserBars />
            JARVIS SPEAKING
          </motion.button>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={muted}
        aria-label={muted ? "Unmute JARVIS voice" : "Mute JARVIS voice"}
        data-cursor={muted ? "UNMUTE" : "MUTE"}
        className={`flex h-9 w-9 items-center justify-center border backdrop-blur transition-colors ${
          muted
            ? "border-[var(--line)] bg-[var(--bg-deep)]/80 text-[var(--muted)] hover:text-[var(--text)]"
            : "border-[var(--accent)]/50 bg-[var(--bg-deep)]/80 text-[var(--accent)]"
        }`}
      >
        {muted ? <MutedIcon /> : <SpeakerIcon />}
      </button>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M16 8.5a4 4 0 0 1 0 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function MutedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M17 9.5l4 5M21 9.5l-4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
