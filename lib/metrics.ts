// Pure helpers for turning freeform caseStudyFields metric strings into
// chartable values. No hardcoded results — everything is derived from the
// strings WordPress returns (e.g. "3,750", "AED 42,100", "-28%", "+50%", "3.8x").

export type ParsedMetric = {
  prefix: string;
  value: number;
  suffix: string;
  decimals: number;
  group: boolean;
  isPercent: boolean;
  sign: 1 | -1 | 0; // leading + , - / − , or none
};

export function parseMetric(raw: string | null | undefined): ParsedMetric | null {
  if (!raw) return null;
  const match = raw.match(/\d[\d,]*\.?\d*/);
  if (!match) return null;
  const numStr = match[0];
  const start = match.index ?? 0;
  const clean = numStr.replace(/,/g, "");
  const value = parseFloat(clean);
  if (Number.isNaN(value)) return null;
  const prefix = raw.slice(0, start);
  const suffix = raw.slice(start + numStr.length);
  const decimals = clean.includes(".")
    ? (clean.split(".")[1]?.length ?? 0)
    : 0;
  const isPercent = raw.includes("%");
  const sign = /[-−]/.test(prefix) ? -1 : prefix.includes("+") ? 1 : 0;
  return {
    prefix,
    value,
    suffix,
    decimals,
    group: numStr.includes(","),
    isPercent,
    sign,
  };
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/**
 * A 0..1 chart fraction for each metric in a grid:
 * - percentages map to |value| / 100
 * - other numbers map to their magnitude relative to the largest non-percent
 *   value in the same grid (so bars show relative weight, never below a sliver).
 */
export function metricFractions(metrics: (string | null)[]): number[] {
  const parsed = metrics.map((m) => parseMetric(m));
  const absVals = parsed
    .filter((p): p is ParsedMetric => !!p && !p.isPercent)
    .map((p) => Math.abs(p.value));
  const maxAbs = absVals.length ? Math.max(...absVals) : 1;
  return parsed.map((p) => {
    if (!p) return 0;
    const frac = p.isPercent
      ? Math.abs(p.value) / 100
      : Math.abs(p.value) / (maxAbs || 1);
    return clamp(frac, 0.06, 1);
  });
}

export type BeforeAfter = {
  label: string;
  delta: string; // original metric string, e.g. "−28%"
  improvement: "down" | "up"; // down = a reduction is good, up = growth is good
  beforeFrac: number;
  afterFrac: number;
};

/**
 * Derives a before→after delta from the first signed percentage among the
 * candidates (hero metric preferred). A "-28%" reduction renders 100 → 72;
 * a "+50%" growth renders 100 → 150 (normalized so the larger bar is full).
 * Returns null when no signed percentage exists, so the block only shows when
 * the data genuinely supports it.
 */
export function deriveBeforeAfter(
  candidates: { metric: string | null; label: string | null }[],
): BeforeAfter | null {
  for (const c of candidates) {
    const p = parseMetric(c.metric);
    if (!p || !p.isPercent || p.sign === 0) continue;
    const pct = Math.abs(p.value);
    const before = 100;
    const after = p.sign < 0 ? Math.max(0, 100 - pct) : 100 + pct;
    const max = Math.max(before, after) || 1;
    return {
      label: c.label ?? "Result",
      delta: (c.metric ?? "").trim(),
      improvement: p.sign < 0 ? "down" : "up",
      beforeFrac: before / max,
      afterFrac: after / max,
    };
  }
  return null;
}

/** Splits The Execution / The Strategy into discrete steps for a pipeline. */
export function splitSteps(text: string | null | undefined): string[] {
  if (!text) return [];
  const t = text.trim();
  if (!t) return [];
  if (t.includes("•")) {
    return t
      .split("•")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (/\r?\n/.test(t)) {
    return t
      .split(/\r?\n+/)
      .map((s) => s.trim().replace(/^[-–•]\s*/, ""))
      .filter(Boolean);
  }
  const sentences = t.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 1) {
    return sentences.map((s) => s.trim()).filter(Boolean);
  }
  return [t];
}

/** Channels for the chip row — servicesUsed (comma/middot split) + serviceTypes, deduped. */
export function parseChannels(
  servicesUsed: string | null | undefined,
  serviceTypes: { name: string }[],
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (v: string) => {
    const t = v.trim();
    if (!t) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(t);
  };
  (servicesUsed ?? "").split(/[,·]/).forEach(add);
  serviceTypes.forEach((s) => add(s.name));
  return out;
}
