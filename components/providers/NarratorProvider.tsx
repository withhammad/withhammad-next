"use client";

// Narration controller — one audio channel for the whole site.
//
// Design rules from the brief, enforced here:
//   - Only ever ONE clip audible: switching sections crossfades out the old
//     clip before the new one rises. Never overlap.
//   - Nothing plays before a user gesture (browser autoplay policy) — clicking
//     a Narratable IS that gesture, so the first click always works.
//   - Muted state persists to localStorage, separate from ambient SFX.
//   - Narration is supplementary. Every word is also on the page as text; if
//     an MP3 is missing (keys not set yet), clicking simply does nothing
//     visible beyond a brief "unavailable" state.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const MUTE_KEY = "wh:voice-muted";
const HINT_KEY = "wh:voice-hint-seen";
const FADE_MS = 260;

type NarratorState = {
  /** id of the clip currently playing, or null */
  active: string | null;
  muted: boolean;
  /** true once any narration has been attempted (drives the HUD) */
  ready: boolean;
  hintSeen: boolean;
  play: (id: string) => void;
  stop: () => void;
  toggleMute: () => void;
  dismissHint: () => void;
  /** Speak arbitrary text (chat replies) via /api/voice */
  speak: (text: string) => Promise<void>;
};

const Ctx = createContext<NarratorState | null>(null);

export function useNarrator(): NarratorState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Rendered outside the provider (e.g. a stray story) — no-op rather than throw.
    return {
      active: null,
      muted: true,
      ready: false,
      hintSeen: true,
      play: () => {},
      stop: () => {},
      toggleMute: () => {},
      dismissHint: () => {},
      speak: async () => {},
    };
  }
  return ctx;
}

export default function NarratorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const [hintSeen, setHintSeen] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
      setHintSeen(localStorage.getItem(HINT_KEY) === "1");
    } catch {
      /* storage blocked — defaults are fine */
    }
  }, []);

  const clearFade = () => {
    if (fadeRef.current !== null) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  };

  /** Fade the current clip out, then dispose it. Resolves when silent. */
  const fadeOut = useCallback((): Promise<void> => {
    const a = audioRef.current;
    if (!a) return Promise.resolve();
    clearFade();
    return new Promise((resolve) => {
      const step = a.volume / (FADE_MS / 20);
      fadeRef.current = window.setInterval(() => {
        const cur = audioRef.current;
        if (!cur) {
          clearFade();
          resolve();
          return;
        }
        cur.volume = Math.max(0, cur.volume - step);
        if (cur.volume <= 0.01) {
          clearFade();
          cur.pause();
          cur.src = "";
          audioRef.current = null;
          resolve();
        }
      }, 20);
    });
  }, []);

  const stop = useCallback(() => {
    void fadeOut().then(() => setActive(null));
  }, [fadeOut]);

  /** Start a source, fading in. Shared by section clips and chat replies. */
  const start = useCallback(
    async (src: string, id: string) => {
      await fadeOut();
      const a = new Audio(src);
      a.volume = 0;
      audioRef.current = a;
      setActive(id);
      setReady(true);

      a.addEventListener("ended", () => {
        if (audioRef.current === a) {
          audioRef.current = null;
          setActive(null);
        }
      });

      try {
        await a.play();
      } catch {
        // autoplay blocked or file missing — fail silent, text still carries it
        audioRef.current = null;
        setActive(null);
        return;
      }

      // fade in
      clearFade();
      const step = 1 / (FADE_MS / 20);
      fadeRef.current = window.setInterval(() => {
        const cur = audioRef.current;
        if (!cur) {
          clearFade();
          return;
        }
        cur.volume = Math.min(1, cur.volume + step);
        if (cur.volume >= 0.99) clearFade();
      }, 20);
    },
    [fadeOut],
  );

  const play = useCallback(
    (id: string) => {
      if (muted) return;
      // clicking the active section again = stop
      if (active === id) {
        stop();
        return;
      }
      void start(`/audio/narration/${id}.mp3`, id);
    },
    [muted, active, start, stop],
  );

  const speak = useCallback(
    async (text: string) => {
      if (muted || !text.trim()) return;
      try {
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) return; // 503 = not configured; stay text-only
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        await start(url, "chat");
      } catch {
        /* network hiccup — silence, never an error state in the UI */
      }
    },
    [muted, start],
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        /* noop */
      }
      if (next) void fadeOut().then(() => setActive(null));
      return next;
    });
  }, [fadeOut]);

  const dismissHint = useCallback(() => {
    setHintSeen(true);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => () => clearFade(), []);

  return (
    <Ctx.Provider
      value={{ active, muted, ready, hintSeen, play, stop, toggleMute, dismissHint, speak }}
    >
      {children}
    </Ctx.Provider>
  );
}
