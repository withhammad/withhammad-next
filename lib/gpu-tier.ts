// ---------------------------------------------------------------------------
// Device tier — the single knob every 3D scene reads.
//
// Written by hand rather than pulling drei's useDetectGPU, which ships a large
// GPU benchmark database. A cheap heuristic (cores, memory, DPR, renderer
// string, coarse pointer) picks the STARTING tier so the first two seconds
// aren't janky; usePerfGuard then downgrades from real frame times if the
// guess was optimistic. Guessing high and correcting beats guessing low and
// never recovering.
// ---------------------------------------------------------------------------

export type Tier = 0 | 1 | 2 | 3;

export type QualitySettings = {
  tier: Tier;
  /** [min, max] dpr for <Canvas dpr> */
  dpr: [number, number];
  /** Particle budget multiplier */
  particles: number;
  /** Post-processing at all */
  post: boolean;
  /** The heavier effects (noise, chromatic aberration) */
  postHeavy: boolean;
  /** MSAA — always off when post is on (the composer handles it) */
  antialias: boolean;
};

export const QUALITY: Record<Tier, QualitySettings> = {
  0: { tier: 0, dpr: [1, 1], particles: 0.25, post: false, postHeavy: false, antialias: false },
  1: { tier: 1, dpr: [1, 1.25], particles: 0.45, post: false, postHeavy: false, antialias: true },
  2: { tier: 2, dpr: [1, 1.5], particles: 0.75, post: true, postHeavy: false, antialias: false },
  3: { tier: 3, dpr: [1, 2], particles: 1, post: true, postHeavy: true, antialias: false },
};

/** Reads the unmasked GPU string when the browser allows it. */
function rendererString(): string {
  if (typeof document === "undefined") return "";
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ||
      c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "")
      : String(gl.getParameter(gl.RENDERER) ?? "");
  } catch {
    return "";
  }
}

/** True when WebGL can't be created at all — callers show the poster instead. */
export function hasWebGL(): boolean {
  if (typeof document === "undefined") return true; // assume yes during SSR
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function detectTier(): Tier {
  if (typeof window === "undefined") return 2;
  if (!hasWebGL()) return 0;

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const gpu = rendererString().toLowerCase();

  // Software rasterisers can't hold a frame budget at any resolution.
  if (/swiftshader|llvmpipe|software|basic render/.test(gpu)) return 1;

  let score = 0;
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0;
  score += mem >= 8 ? 2 : mem >= 4 ? 1 : 0;
  // Discrete/Apple silicon signals
  if (/apple m\d|rtx|radeon rx|geforce|arc a/.test(gpu)) score += 2;
  // Mobile GPUs: capable, but budget conservatively — thermal throttling is real
  if (/adreno|mali|powervr|apple a\d/.test(gpu)) score -= 1;
  if (coarse) score -= 1;

  if (score >= 5) return 3;
  if (score >= 3) return 2;
  if (score >= 1) return 1;
  return 0;
}
