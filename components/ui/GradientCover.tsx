// GradientCover — the site-wide branded fallback/feature graphic.
// Deterministic from a seed string (same seed → same image). Pure &
// presentational, so it renders in server OR client trees. No external images:
// layered CSS gradient-mesh blobs + an abstract SVG pattern (dots/grid/waves/
// orbits) + optional grain, with an optional label/eyebrow/badge overlay.
// Motion (blob drift) is opt-in via `animate` and the global
// prefers-reduced-motion block (globals.css) clamps it to a no-op.

import React from "react";

export type CoverPattern = "auto" | "dots" | "grid" | "waves" | "orbits";
export type CoverVariant = "card" | "hero" | "mini";

interface Theme {
  c1: string;
  c2: string;
  c3: string;
}

// Brand stays indigo + amber; the third accent shifts by category/topic.
const THEMES: Record<string, Theme> = {
  // Blog categories
  "ai & automation": { c1: "#6366F1", c2: "#8B5CF6", c3: "#38BDF8" },
  "paid ads": { c1: "#F59E0B", c2: "#FB7185", c3: "#6366F1" },
  "seo & aeo": { c1: "#6366F1", c2: "#2DD4BF", c3: "#F59E0B" },
  // Case-study service types
  ppc: { c1: "#F59E0B", c2: "#FB7185", c3: "#6366F1" },
  seo: { c1: "#6366F1", c2: "#2DD4BF", c3: "#F59E0B" },
  "paid social": { c1: "#8B5CF6", c2: "#6366F1", c3: "#38BDF8" },
  cro: { c1: "#10B981", c2: "#F59E0B", c3: "#6366F1" },
  "multi-market": { c1: "#6366F1", c2: "#F59E0B", c3: "#38BDF8" },
  // Product tiers
  free: { c1: "#2DD4BF", c2: "#6366F1", c3: "#F59E0B" },
  paid: { c1: "#F59E0B", c2: "#6366F1", c3: "#8B5CF6" },
  premium: { c1: "#8B5CF6", c2: "#F59E0B", c3: "#6366F1" },
};
const FALLBACK: Theme = { c1: "#6366F1", c2: "#F59E0B", c3: "#8B5CF6" };

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const PATTERNS: Exclude<CoverPattern, "auto">[] = [
  "orbits",
  "dots",
  "grid",
  "waves",
];

function wavePath(yBase: number, amp: number, cycles: number, phase: number) {
  const pts: string[] = [];
  for (let x = 0; x <= 400; x += 10) {
    const y = yBase + amp * Math.sin((x / 400) * cycles * Math.PI * 2 + phase);
    pts.push(`${x === 0 ? "M" : "L"} ${x} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function GradientCover({
  seed,
  category,
  label,
  eyebrow,
  badge,
  pattern = "auto",
  variant = "card",
  animate = true,
  className = "",
}: {
  seed: string;
  category?: string | null;
  label?: string | null;
  eyebrow?: string | null;
  badge?: string | null;
  pattern?: CoverPattern;
  variant?: CoverVariant;
  animate?: boolean;
  className?: string;
}) {
  const safeSeed = seed || "with-hammad";
  const theme = (category && THEMES[category.toLowerCase().trim()]) || FALLBACK;
  const rnd = makeRng(hashStr(safeSeed));
  const pick = (min: number, max: number) => min + rnd() * (max - min);
  const uid = `gc${hashStr(safeSeed) % 1000000}`;
  const detail = variant !== "mini";

  const resolved: Exclude<CoverPattern, "auto"> =
    pattern === "auto" ? PATTERNS[hashStr(safeSeed) % PATTERNS.length] : pattern;

  // Gradient-mesh blob anchors (% of box).
  const aX = pick(8, 36);
  const aY = pick(8, 40);
  const bX = pick(60, 92);
  const bY = pick(58, 94);
  const cX = pick(40, 70);
  const cY = pick(20, 50);

  return (
    <div
      aria-hidden
      className={`relative h-full w-full overflow-hidden bg-[#0A0A0B] ${className}`}
    >
      {/* sheen */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.05), transparent 55%)",
        }}
      />
      {/* gradient-mesh blobs */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(42% 52% at ${aX}% ${aY}%, ${theme.c1}66, transparent 70%)`,
          animation: animate ? "pa-drift-a 17s ease-in-out infinite" : undefined,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(46% 56% at ${bX}% ${bY}%, ${theme.c2}54, transparent 72%)`,
          animation: animate ? "pa-drift-b 21s ease-in-out infinite" : undefined,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(30% 36% at ${cX}% ${cY}%, ${theme.c3}3d, transparent 72%)`,
        }}
      />

      {/* abstract pattern */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 260"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern
            id={`${uid}-dots`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="#fff" fillOpacity="0.07" />
          </pattern>
          <pattern
            id={`${uid}-grid`}
            width="34"
            height="34"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 34 0 L 0 0 0 34"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.06"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.c2} />
            <stop offset="100%" stopColor={theme.c1} />
          </linearGradient>
          <filter id={`${uid}-grain`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {resolved === "orbits" &&
          (() => {
            const cx = pick(248, 352);
            const cy = pick(38, 116);
            const arcRot = Math.floor(pick(0, 360));
            const orbit = Array.from({ length: detail ? 3 : 2 }, () => {
              const ang = pick(0, Math.PI * 2);
              return { x: cx + Math.cos(ang) * 64, y: cy + Math.sin(ang) * 64 };
            });
            return (
              <g>
                <g stroke={theme.c3} fill="none">
                  <circle cx={cx} cy={cy} r="88" strokeWidth="1" strokeOpacity="0.16" />
                  <circle cx={cx} cy={cy} r="64" strokeWidth="1" strokeOpacity="0.45" />
                  <circle cx={cx} cy={cy} r="40" strokeWidth="1" strokeOpacity="0.3" />
                </g>
                <g
                  transform={`rotate(${arcRot} ${cx} ${cy})`}
                  style={{
                    animation: animate ? "pa-pulse 6s ease-in-out infinite" : undefined,
                  }}
                >
                  <path
                    d={`M ${cx} ${cy - 64} A 64 64 0 0 1 ${cx + 64} ${cy}`}
                    stroke={`url(#${uid}-stroke)`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
                {orbit.map((o, i) => (
                  <circle
                    key={i}
                    cx={o.x}
                    cy={o.y}
                    r={i === 0 ? 4 : 2.5}
                    fill={i === 0 ? theme.c2 : "#fff"}
                    fillOpacity={i === 0 ? 0.95 : 0.6}
                  />
                ))}
              </g>
            );
          })()}

        {resolved === "dots" &&
          (() => {
            const sqCx = pick(250, 350);
            const sqCy = pick(60, 150);
            const sqRot = Math.floor(pick(0, 45));
            const pluses = Array.from({ length: detail ? 5 : 3 }, () => ({
              x: pick(24, 376),
              y: pick(22, 238),
              s: pick(5, 9),
            }));
            return (
              <g>
                <rect width="400" height="260" fill={`url(#${uid}-dots)`} />
                <rect
                  x={sqCx - 30}
                  y={sqCy - 30}
                  width="60"
                  height="60"
                  rx="10"
                  transform={`rotate(${sqRot} ${sqCx} ${sqCy})`}
                  stroke={`url(#${uid}-stroke)`}
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                />
                {pluses.map((p, i) => (
                  <g key={i} stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2">
                    <line x1={p.x - p.s} y1={p.y} x2={p.x + p.s} y2={p.y} />
                    <line x1={p.x} y1={p.y - p.s} x2={p.x} y2={p.y + p.s} />
                  </g>
                ))}
              </g>
            );
          })()}

        {resolved === "grid" &&
          (() => {
            const cellX = Math.floor(pick(5, 9)) * 34;
            const cellY = Math.floor(pick(1, 4)) * 34;
            const nodes = Array.from({ length: detail ? 5 : 3 }, () => ({
              x: Math.round(pick(1, 11)) * 34,
              y: Math.round(pick(1, 7)) * 34,
            }));
            return (
              <g>
                <rect width="400" height="260" fill={`url(#${uid}-grid)`} />
                <rect
                  x={cellX}
                  y={cellY}
                  width="34"
                  height="34"
                  fill={theme.c1}
                  fillOpacity="0.18"
                  stroke={`url(#${uid}-stroke)`}
                  strokeWidth="1.5"
                />
                {nodes.map((n, i) => (
                  <circle
                    key={i}
                    cx={n.x}
                    cy={n.y}
                    r={i === 0 ? 3.5 : 2}
                    fill={i === 0 ? theme.c2 : "#fff"}
                    fillOpacity={i === 0 ? 0.9 : 0.5}
                  />
                ))}
              </g>
            );
          })()}

        {resolved === "waves" &&
          (() => {
            const phase = pick(0, Math.PI * 2);
            const rows = [
              { y: 110, a: 16, c: 1.5, o: 0.5, w: 2.5, g: true },
              { y: 150, a: 22, c: 1.2, o: 0.28, w: 1.5, g: false },
              { y: 190, a: 14, c: 2, o: 0.18, w: 1.5, g: false },
            ];
            return (
              <g>
                <rect width="400" height="260" fill={`url(#${uid}-dots)`} />
                {rows.map((r, i) => (
                  <path
                    key={i}
                    d={wavePath(r.y, r.a, r.c, phase + i * 0.7)}
                    stroke={r.g ? `url(#${uid}-stroke)` : "#fff"}
                    strokeOpacity={r.o}
                    strokeWidth={r.w}
                    strokeLinecap="round"
                    fill="none"
                  />
                ))}
              </g>
            );
          })()}

        <rect width="400" height="260" filter={`url(#${uid}-grain)`} opacity="0.05" />
      </svg>

      {/* depth vignette + bottom fade (stronger when there's overlaid text) */}
      <div
        className="absolute inset-0"
        style={{
          background: label
            ? "linear-gradient(to top, rgba(0,0,0,0.72) 4%, rgba(0,0,0,0.25) 42%, transparent 75%)"
            : "radial-gradient(130% 110% at 50% 0%, transparent 50%, rgba(0,0,0,0.5))",
        }}
      />

      {/* badge (top-right) */}
      {badge ? (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium tracking-wide text-[var(--text)] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-amber)]" />
          {badge}
        </span>
      ) : null}

      {/* label / eyebrow (bottom-left) */}
      {label || eyebrow ? (
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          {eyebrow ? (
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent-amber)]">
              {eyebrow}
            </div>
          ) : null}
          {label ? (
            <div
              className="font-semibold leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]"
              style={{
                fontSize:
                  variant === "hero"
                    ? "clamp(1.4rem, 2.6vw, 2.1rem)"
                    : "clamp(1.05rem, 1.6vw, 1.35rem)",
              }}
            >
              {label}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
