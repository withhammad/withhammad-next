"use client";

// UI sound, synthesised — no audio assets, no Howler.
//
// Why synthesis: the SFX this needs (hover blip, whoosh, boot chime, message
// ping) are a few hundred bytes of oscillator maths each. Shipping sample
// files plus a 30KB audio library to play them would cost more than the whole
// Phase 1 font budget, for four sounds. The ambient bed is likewise two
// detuned oscillators through a lowpass — a drone, not a loop that repeats.
//
// Policy, per the brief:
//   - MUTED BY DEFAULT. Browsers block autoplay anyway, and an unexpected
//     drone is the fastest way to make someone close a tab.
//   - Choice persists to localStorage, separate from the JARVIS voice toggle.
//   - The AudioContext is only constructed after the first user gesture.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const KEY = "wh:sfx-muted";

export type Sfx = "hover" | "click" | "whoosh" | "boot" | "ping";

type SoundState = {
  muted: boolean;
  toggleMute: () => void;
  play: (s: Sfx) => void;
};

const Ctx = createContext<SoundState>({
  muted: true,
  toggleMute: () => {},
  play: () => {},
});

export const useSound = () => useContext(Ctx);

export default function SoundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [muted, setMuted] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambientRef = useRef<{ stop: () => void } | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    try {
      // default muted unless explicitly enabled before
      setMuted(localStorage.getItem(KEY) !== "0");
    } catch {
      /* storage blocked */
    }
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const ensureCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.22; // UI sound should sit under everything
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  /** Short enveloped tone. All four SFX are variations on this. */
  const blip = useCallback(
    (
      freq: number,
      dur: number,
      type: OscillatorType = "sine",
      sweepTo?: number,
      gain = 1,
    ) => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },
    [],
  );

  const startAmbient = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || ambientRef.current || reducedRef.current) return;
    const g = ctx.createGain();
    g.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 340;
    const a = ctx.createOscillator();
    const b = ctx.createOscillator();
    a.type = "sine";
    b.type = "sine";
    a.frequency.value = 55;
    b.frequency.value = 55.6; // slight detune → slow beating, feels alive
    a.connect(filter);
    b.connect(filter);
    filter.connect(g).connect(master);
    a.start();
    b.start();
    g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2.5);
    ambientRef.current = {
      stop: () => {
        try {
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
          a.stop(ctx.currentTime + 0.5);
          b.stop(ctx.currentTime + 0.5);
        } catch {
          /* already stopped */
        }
        ambientRef.current = null;
      },
    };
  }, []);

  const play = useCallback(
    (s: Sfx) => {
      if (muted) return;
      if (!ensureCtx()) return;
      switch (s) {
        case "hover":
          blip(1400, 0.05, "sine", 1800, 0.25);
          break;
        case "click":
          blip(720, 0.09, "triangle", 480, 0.5);
          break;
        case "whoosh":
          blip(180, 0.36, "sawtooth", 60, 0.28);
          break;
        case "boot":
          blip(420, 0.18, "sine", 880, 0.45);
          window.setTimeout(() => blip(880, 0.22, "sine", 1320, 0.35), 130);
          break;
        case "ping":
          blip(1046, 0.16, "sine", 1568, 0.4);
          break;
      }
    },
    [muted, ensureCtx, blip],
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        /* noop */
      }
      if (next) {
        ambientRef.current?.stop();
      } else {
        // unmuting IS the user gesture that unlocks audio
        if (ensureCtx()) {
          startAmbient();
          blip(420, 0.18, "sine", 880, 0.45);
        }
      }
      return next;
    });
  }, [ensureCtx, startAmbient, blip]);

  // Global hover/click sonification — one listener pair, no per-component wiring.
  useEffect(() => {
    if (muted) return;
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "a, button, [role='button']",
      );
      if (el) play("hover");
    };
    const onDown = () => play("click");
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [muted, play]);

  useEffect(
    () => () => {
      ambientRef.current?.stop();
      void ctxRef.current?.close();
    },
    [],
  );

  return (
    <Ctx.Provider value={{ muted, toggleMute, play }}>{children}</Ctx.Provider>
  );
}
