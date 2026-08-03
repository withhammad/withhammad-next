// ---------------------------------------------------------------------------
// Motion foundations — the single source of truth for how this site moves.
// Every DOM animation (framer-motion == motion.dev) and GSAP tween should pull
// its timing from here so the whole experience shares one rhythm.
// ---------------------------------------------------------------------------

/** Signature ease — fast attack, long cinematic settle. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Spring presets. Game-feel rule: respond within 100ms, settle without wobble. */
export const SPRING_SNAPPY = {
  type: "spring" as const,
  stiffness: 120,
  damping: 18,
  mass: 0.9,
};
export const SPRING_SOFT = {
  type: "spring" as const,
  stiffness: 80,
  damping: 24,
  mass: 1,
};

/** Stagger presets (seconds between children). */
export const STAGGER_TIGHT = 0.04;
export const STAGGER_BASE = 0.08;
export const STAGGER_LOOSE = 0.14;

/** Clip-path mask reveals — pair `hidden` → `visible` on motion elements. */
export const MASK_UP = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)", y: 24 },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    y: 0,
    transition: { duration: 0.9, ease: EASE },
  },
};
export const MASK_WIPE = {
  hidden: { clipPath: "inset(0% 100% 0% 0%)" },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.7, ease: EASE },
  },
};

export const FADE_RISE = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

/** Parent variant that staggers any of the above through its children. */
export const staggerParent = (stagger = STAGGER_BASE, delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
