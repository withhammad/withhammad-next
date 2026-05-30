// Deterministic, on-brand abstract cover art for blog posts.
// No external images: each post gets a unique-but-consistent composition
// (layered gradient mesh + geometric SVG motifs + grain) seeded from its slug
// and themed by category. Pure/presentational — safe in server or client trees.
// Motion comes from CSS keyframes (pa-drift-*) which the global
// prefers-reduced-motion block auto-disables.

import React from "react";

type Variant = "card" | "hero" | "mini";

interface Theme {
  c1: string;
  c2: string;
  c3: string;
}

// Brand stays indigo + amber; the third accent shifts by category.
// Keys cover blog categories AND case-study service types (lowercased).
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

export default function PostArtwork({
  seed,
  category,
  variant = "card",
  className = "",
  animate = true,
}: {
  seed: string;
  category?: string | null;
  variant?: Variant;
  className?: string;
  animate?: boolean;
}) {
  const theme =
    (category && THEMES[category.toLowerCase().trim()]) || FALLBACK;

  const safeSeed = seed || "with-hammad";
  const rnd = makeRng(hashStr(safeSeed));
  const pick = (min: number, max: number) => min + rnd() * (max - min);
  const uid = `pa${hashStr(safeSeed) % 1000000}`;
  const detail = variant !== "mini";

  // Blob anchor points (percent of box).
  const aX = pick(8, 36);
  const aY = pick(8, 40);
  const bX = pick(60, 92);
  const bY = pick(58, 94);

  // Ring system center (px in the 400×260 viewBox).
  const ringCx = pick(248, 352);
  const ringCy = pick(38, 116);
  const arcRot = Math.floor(pick(0, 360));

  // Orbiting dots on the primary ring.
  const orbit = Array.from({ length: detail ? 3 : 2 }, () => {
    const ang = pick(0, Math.PI * 2);
    return { x: ringCx + Math.cos(ang) * 64, y: ringCy + Math.sin(ang) * 64 };
  });

  // Rotated square.
  const sqCx = pick(44, 150);
  const sqCy = pick(150, 222);
  const sqRot = Math.floor(pick(0, 45));

  // Scattered plus marks.
  const pluses = Array.from({ length: detail ? 4 : 2 }, () => ({
    x: pick(24, 376),
    y: pick(22, 238),
    s: pick(5, 9),
  }));

  return (
    <div
      aria-hidden
      className={`relative h-full w-full overflow-hidden bg-[#0A0A0B] ${className}`}
    >
      {/* top sheen */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.05), transparent 55%)",
        }}
      />

      {/* drifting color blobs */}
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
          background: `radial-gradient(30% 34% at ${ringCx / 4}% ${
            (ringCy / 260) * 100
          }%, ${theme.c3}3d, transparent 72%)`,
        }}
      />

      {/* geometric scene */}
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
          <linearGradient id={`${uid}-arc`} x1="0" y1="0" x2="1" y2="1">
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

        {/* dot grid */}
        <rect width="400" height="260" fill={`url(#${uid}-dots)`} />

        {/* concentric rings */}
        <g stroke={theme.c3} fill="none">
          <circle cx={ringCx} cy={ringCy} r="88" strokeWidth="1" strokeOpacity="0.16" />
          <circle cx={ringCx} cy={ringCy} r="64" strokeWidth="1" strokeOpacity="0.45" />
          <circle cx={ringCx} cy={ringCy} r="40" strokeWidth="1" strokeOpacity="0.3" />
        </g>

        {/* bold arc accent */}
        <g
          transform={`rotate(${arcRot} ${ringCx} ${ringCy})`}
          style={{ animation: animate ? "pa-pulse 6s ease-in-out infinite" : undefined }}
        >
          <path
            d={`M ${ringCx} ${ringCy - 64} A 64 64 0 0 1 ${ringCx + 64} ${ringCy}`}
            stroke={`url(#${uid}-arc)`}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* orbiting dots */}
        {orbit.map((o, i) => (
          <circle
            key={`o${i}`}
            cx={o.x}
            cy={o.y}
            r={i === 0 ? 4 : 2.5}
            fill={i === 0 ? theme.c2 : "#fff"}
            fillOpacity={i === 0 ? 0.95 : 0.6}
          />
        ))}

        {/* rotated square */}
        <rect
          x={sqCx - 26}
          y={sqCy - 26}
          width="52"
          height="52"
          rx="8"
          transform={`rotate(${sqRot} ${sqCx} ${sqCy})`}
          stroke={theme.c1}
          strokeOpacity="0.5"
          strokeWidth="1.3"
        />

        {/* plus marks */}
        {pluses.map((p, i) => (
          <g key={`p${i}`} stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2">
            <line x1={p.x - p.s} y1={p.y} x2={p.x + p.s} y2={p.y} />
            <line x1={p.x} y1={p.y - p.s} x2={p.x} y2={p.y + p.s} />
          </g>
        ))}

        {/* grain */}
        <rect
          width="400"
          height="260"
          filter={`url(#${uid}-grain)`}
          opacity="0.05"
        />
      </svg>

      {/* depth vignette + bottom fade for overlaid text */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 110% at 50% 0%, transparent 50%, rgba(0,0,0,0.5))",
        }}
      />
    </div>
  );
}
